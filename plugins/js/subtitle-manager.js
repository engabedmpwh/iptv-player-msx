/**
 * Subtitle Manager
 * Handles subtitle fetching, searching, and management
 */

var SubtitleManager = (function() {
    'use strict';

    /**
     * Search for subtitles by query and language
     * @param {string} query - Movie/show name or IMDB ID
     * @param {string} language - Language code (en, ar, es, etc.)
     * @returns {Promise<Array>} Array of subtitle results
     */
    async function searchSubtitles(query, language) {
        var servers = IPTVStorage.getSubtitleServers();

        if (servers.length === 0) {
            throw new Error('No subtitle servers configured');
        }

        var allResults = [];

        for (var i = 0; i < servers.length; i++) {
            var server = servers[i];

            // Only search on servers with the requested language
            if (server.languages.indexOf(language) === -1) {
                continue;
            }

            try {
                var results = await searchOnServer(server, query, language);
                allResults = allResults.concat(results);
            } catch (e) {
                console.error('Error searching on server ' + server.name + ':', e);
            }
        }

        return allResults;
    }

    /**
     * Search on specific server
     */
    async function searchOnServer(server, query, language) {
        switch (server.serverType) {
            case 'opensubtitles':
                return await searchOpenSubtitles(server, query, language);
            case 'custom':
                return await searchCustomAPI(server, query, language);
            case 'local':
                return getLocalSubtitles(language);
            default:
                return [];
        }
    }

    /**
     * Search OpenSubtitles API
     */
    async function searchOpenSubtitles(server, query, language) {
        if (!server.apiKey) {
            throw new Error('OpenSubtitles requires an API key');
        }

        var url = (server.apiUrl || 'https://api.opensubtitles.com/api/v1') +
                  '/subtitles?query=' + encodeURIComponent(query) +
                  '&languages=' + language;

        var response = await fetch(url, {
            headers: {
                'Api-Key': server.apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('OpenSubtitles API error: ' + response.status);
        }

        var data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            return [];
        }

        return data.data.map(function(sub) {
            return {
                id: sub.attributes.files[0].file_id,
                name: sub.attributes.release || sub.attributes.feature_details.title,
                language: sub.attributes.language,
                downloads: sub.attributes.download_count,
                url: sub.attributes.files[0].file_id, // Will be used to download
                format: sub.attributes.files[0].file_name.split('.').pop(),
                serverType: 'opensubtitles',
                serverInfo: server
            };
        });
    }

    /**
     * Search custom API
     */
    async function searchCustomAPI(server, query, language) {
        var url = server.apiUrl + '?query=' + encodeURIComponent(query) + '&lang=' + language;

        var headers = {};
        if (server.apiKey) {
            headers['Authorization'] = 'Bearer ' + server.apiKey;
        }

        var response = await fetch(url, { headers: headers });

        if (!response.ok) {
            throw new Error('Custom API error: ' + response.status);
        }

        var data = await response.json();

        // Expected format: array of {name, url, language, format}
        return data.map(function(sub) {
            return {
                id: sub.id || sub.url,
                name: sub.name,
                language: sub.language || language,
                url: sub.url,
                format: sub.format || 'srt',
                serverType: 'custom',
                serverInfo: server
            };
        });
    }

    /**
     * Get local subtitles
     */
    function getLocalSubtitles(language) {
        var localSubs = IPTVStorage.getLocalSubtitles();

        return localSubs.filter(function(sub) {
            return sub.language === language;
        });
    }

    /**
     * Download subtitle file
     */
    async function downloadSubtitle(subtitle) {
        if (subtitle.serverType === 'opensubtitles') {
            return await downloadFromOpenSubtitles(subtitle);
        } else if (subtitle.serverType === 'custom' || subtitle.serverType === 'local') {
            return await downloadFromURL(subtitle.url);
        }

        throw new Error('Unknown server type');
    }

    /**
     * Download from OpenSubtitles
     */
    async function downloadFromOpenSubtitles(subtitle) {
        var url = (subtitle.serverInfo.apiUrl || 'https://api.opensubtitles.com/api/v1') +
                  '/download';

        var response = await fetch(url, {
            method: 'POST',
            headers: {
                'Api-Key': subtitle.serverInfo.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file_id: subtitle.url
            })
        });

        if (!response.ok) {
            throw new Error('Download failed: ' + response.status);
        }

        var data = await response.json();

        // Get the download link
        if (data.link) {
            return await downloadFromURL(data.link);
        }

        throw new Error('No download link provided');
    }

    /**
     * Download from direct URL
     */
    async function downloadFromURL(url) {
        var response = await fetch(url);

        if (!response.ok) {
            throw new Error('Download failed: ' + response.status);
        }

        var content = await response.text();
        return content;
    }

    /**
     * Convert subtitle format (SRT to VTT)
     */
    function convertSRTtoVTT(srtContent) {
        // Add WEBVTT header
        var vtt = 'WEBVTT\n\n';

        // Replace timestamps: 00:00:00,000 --> 00:00:00.000
        vtt += srtContent.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');

        return vtt;
    }

    /**
     * Save subtitle for offline use
     */
    function saveSubtitle(channelId, language, content, format) {
        var subtitle = {
            channelId: channelId,
            language: language,
            content: content,
            format: format,
            savedAt: new Date().toISOString()
        };

        IPTVStorage.saveChannelSubtitle(channelId, language, subtitle);
        return subtitle;
    }

    /**
     * Get saved subtitle for channel
     */
    function getSavedSubtitle(channelId, language) {
        return IPTVStorage.getChannelSubtitle(channelId, language);
    }

    /**
     * Auto-load subtitles for content
     */
    async function autoLoadSubtitles(contentName, channelId) {
        var servers = IPTVStorage.getSubtitleServers();
        var autoLoadServers = servers.filter(function(s) { return s.autoLoad; });

        if (autoLoadServers.length === 0) {
            return null;
        }

        // Try each preferred language
        for (var i = 0; i < autoLoadServers.length; i++) {
            var server = autoLoadServers[i];

            for (var j = 0; j < server.languages.length; j++) {
                var lang = server.languages[j];

                try {
                    // Check if already saved
                    var saved = getSavedSubtitle(channelId, lang);
                    if (saved) {
                        return saved;
                    }

                    // Search and download
                    var results = await searchSubtitles(contentName, lang);

                    if (results.length > 0) {
                        // Download the first (most relevant) subtitle
                        var content = await downloadSubtitle(results[0]);

                        // Convert to VTT if needed
                        if (results[0].format === 'srt') {
                            content = convertSRTtoVTT(content);
                        }

                        // Save for offline use
                        return saveSubtitle(channelId, lang, content, 'vtt');
                    }
                } catch (e) {
                    console.error('Error auto-loading subtitle:', e);
                }
            }
        }

        return null;
    }

    /**
     * Get available languages from configured servers
     */
    function getAvailableLanguages() {
        var servers = IPTVStorage.getSubtitleServers();
        var languages = {};

        servers.forEach(function(server) {
            server.languages.forEach(function(lang) {
                languages[lang] = true;
            });
        });

        return Object.keys(languages);
    }

    // Public API
    return {
        searchSubtitles: searchSubtitles,
        downloadSubtitle: downloadSubtitle,
        convertSRTtoVTT: convertSRTtoVTT,
        saveSubtitle: saveSubtitle,
        getSavedSubtitle: getSavedSubtitle,
        autoLoadSubtitles: autoLoadSubtitles,
        getAvailableLanguages: getAvailableLanguages
    };
})();
