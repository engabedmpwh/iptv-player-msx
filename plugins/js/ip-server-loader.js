/**
 * IP Server Channel Loader
 * Loads channels from IP-based IPTV servers (Xtream Codes, M3U endpoints, etc.)
 */

var IPServerLoader = (function() {
    'use strict';

    /**
     * Load channels from server
     * @param {Object} serverInfo - Server configuration
     * @returns {Promise<Array>} Array of channels
     */
    async function loadChannels(serverInfo) {
        // Build base URL
        var baseUrl = serverInfo.protocol + '://' + serverInfo.ip + ':' + serverInfo.port;
        var apiPath = serverInfo.apiPath || '/player_api.php';

        // Try Xtream Codes API first
        if (apiPath.includes('player_api')) {
            return await loadXtreamChannels(baseUrl, apiPath, serverInfo.username, serverInfo.password);
        }

        // Try M3U endpoint
        if (apiPath.includes('get.php') || apiPath.includes('.m3u')) {
            return await loadM3UFromServer(baseUrl, apiPath, serverInfo.username, serverInfo.password);
        }

        // Default: try both methods
        try {
            return await loadXtreamChannels(baseUrl, '/player_api.php', serverInfo.username, serverInfo.password);
        } catch (e) {
            return await loadM3UFromServer(baseUrl, '/get.php', serverInfo.username, serverInfo.password);
        }
    }

    /**
     * Load channels using Xtream Codes API
     */
    async function loadXtreamChannels(baseUrl, apiPath, username, password) {
        var url = baseUrl + apiPath +
                 '?username=' + encodeURIComponent(username) +
                 '&password=' + encodeURIComponent(password) +
                 '&action=get_live_streams';

        var response = await fetch(url);

        if (!response.ok) {
            throw new Error('Server returned error: ' + response.status);
        }

        var data = await response.json();

        if (!data || !Array.isArray(data)) {
            throw new Error('Invalid response from server');
        }

        // Convert Xtream format to channel format
        var channels = data.map(function(stream) {
            var streamUrl = baseUrl + '/live/' + username + '/' + password + '/' + stream.stream_id + '.ts';

            return {
                name: stream.name || 'Unknown Channel',
                url: streamUrl,
                logo: stream.stream_icon || '',
                category: stream.category_name || 'Uncategorized',
                epg_channel_id: stream.epg_channel_id || '',
                stream_id: stream.stream_id
            };
        });

        return channels;
    }

    /**
     * Load M3U playlist from server
     */
    async function loadM3UFromServer(baseUrl, apiPath, username, password) {
        var url = baseUrl + apiPath +
                 '?username=' + encodeURIComponent(username) +
                 '&password=' + encodeURIComponent(password) +
                 '&type=m3u_plus';

        var response = await fetch(url);

        if (!response.ok) {
            throw new Error('Server returned error: ' + response.status);
        }

        var m3uContent = await response.text();

        // Use existing M3U parser if available
        if (typeof M3UParser !== 'undefined' && M3UParser.parse) {
            return M3UParser.parse(m3uContent);
        }

        // Simple M3U parser fallback
        return parseSimpleM3U(m3uContent);
    }

    /**
     * Simple M3U parser (fallback)
     */
    function parseSimpleM3U(content) {
        var channels = [];
        var lines = content.split('\n');
        var currentChannel = null;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();

            if (line.startsWith('#EXTINF:')) {
                currentChannel = {};

                // Extract channel name (after last comma)
                var nameParts = line.split(',');
                currentChannel.name = nameParts[nameParts.length - 1].trim();

                // Extract logo
                var logoMatch = line.match(/tvg-logo="([^"]*)"/);
                if (logoMatch) {
                    currentChannel.logo = logoMatch[1];
                }

                // Extract category
                var groupMatch = line.match(/group-title="([^"]*)"/);
                if (groupMatch) {
                    currentChannel.category = groupMatch[1];
                } else {
                    currentChannel.category = 'Uncategorized';
                }

            } else if (line && !line.startsWith('#') && currentChannel) {
                currentChannel.url = line;
                channels.push(currentChannel);
                currentChannel = null;
            }
        }

        return channels;
    }

    /**
     * Test server connection
     */
    async function testConnection(serverInfo) {
        var baseUrl = serverInfo.protocol + '://' + serverInfo.ip + ':' + serverInfo.port;
        var apiPath = serverInfo.apiPath || '/player_api.php';

        var url = baseUrl + apiPath +
                 '?username=' + encodeURIComponent(serverInfo.username) +
                 '&password=' + encodeURIComponent(serverInfo.password);

        try {
            var response = await fetch(url);
            return response.ok;
        } catch (e) {
            return false;
        }
    }

    // Public API
    return {
        loadChannels: loadChannels,
        testConnection: testConnection
    };
})();
