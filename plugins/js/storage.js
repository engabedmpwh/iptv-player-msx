/**
 * IPTV Storage Manager
 * Handles playlists and channels in localStorage
 */

var IPTVStorage = (function() {
    'use strict';

    var PLAYLISTS_KEY = 'iptv_playlists';
    var CHANNELS_KEY = 'iptv_channels';
    var FAVORITES_KEY = 'iptv_favorites';
    var SETTINGS_KEY = 'iptv_settings';
    var IPSERVERS_KEY = 'iptv_ip_servers';
    var SUBTITLE_SERVERS_KEY = 'iptv_subtitle_servers';
    var CHANNEL_SUBTITLES_KEY = 'iptv_channel_subtitles';
    var LOCAL_SUBTITLES_KEY = 'iptv_local_subtitles';

    /**
     * Get all playlists
     */
    function getPlaylists() {
        try {
            var stored = localStorage.getItem(PLAYLISTS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error reading playlists:', e);
            return [];
        }
    }

    /**
     * Save playlists
     */
    function savePlaylists(playlists) {
        try {
            localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
            return true;
        } catch (e) {
            console.error('Error saving playlists:', e);
            return false;
        }
    }

    /**
     * Add playlist
     */
    function addPlaylist(playlist) {
        var playlists = getPlaylists();
        playlist.id = generateId();
        playlist.createdAt = new Date().toISOString();
        playlist.enabled = true;
        playlists.push(playlist);
        savePlaylists(playlists);
        return playlist;
    }

    /**
     * Delete playlist
     */
    function deletePlaylist(id) {
        var playlists = getPlaylists();
        var filtered = playlists.filter(function(p) {
            return p.id !== id;
        });
        savePlaylists(filtered);

        // Also delete associated channels
        var channels = getChannels();
        var filteredChannels = channels.filter(function(c) {
            return c.playlistId !== id;
        });
        saveChannels(filteredChannels);

        return true;
    }

    /**
     * Get all channels
     */
    function getChannels() {
        try {
            var stored = localStorage.getItem(CHANNELS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error reading channels:', e);
            return [];
        }
    }

    /**
     * Save channels
     */
    function saveChannels(channels) {
        try {
            localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
            return true;
        } catch (e) {
            console.error('Error saving channels:', e);
            return false;
        }
    }

    /**
     * Add channels from playlist
     */
    function addChannels(playlistId, channels) {
        var existing = getChannels();

        // Remove old channels from this playlist
        existing = existing.filter(function(c) {
            return c.playlistId !== playlistId;
        });

        // Add new channels
        for (var i = 0; i < channels.length; i++) {
            channels[i].id = generateId();
            channels[i].playlistId = playlistId;
            existing.push(channels[i]);
        }

        saveChannels(existing);
        return true;
    }

    /**
     * Get channels by category
     */
    function getChannelsByCategory(category) {
        var channels = getChannels();
        if (!category || category === 'all') {
            return channels;
        }
        return channels.filter(function(c) {
            return c.category === category;
        });
    }

    /**
     * Get all categories
     */
    function getCategories() {
        var channels = getChannels();
        var categories = {};

        for (var i = 0; i < channels.length; i++) {
            var cat = channels[i].category || 'Uncategorized';
            if (!categories[cat]) {
                categories[cat] = 0;
            }
            categories[cat]++;
        }

        var result = [];
        for (var key in categories) {
            result.push({
                name: key,
                count: categories[key]
            });
        }

        return result.sort(function(a, b) {
            return b.count - a.count;
        });
    }

    /**
     * Get favorites
     */
    function getFavorites() {
        try {
            var stored = localStorage.getItem(FAVORITES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error reading favorites:', e);
            return [];
        }
    }

    /**
     * Add to favorites
     */
    function addFavorite(channelId) {
        var favorites = getFavorites();
        if (favorites.indexOf(channelId) === -1) {
            favorites.push(channelId);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        }
        return true;
    }

    /**
     * Remove from favorites
     */
    function removeFavorite(channelId) {
        var favorites = getFavorites();
        var filtered = favorites.filter(function(id) {
            return id !== channelId;
        });
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
        return true;
    }

    /**
     * Check if channel is favorite
     */
    function isFavorite(channelId) {
        var favorites = getFavorites();
        return favorites.indexOf(channelId) !== -1;
    }

    /**
     * Get favorite channels
     */
    function getFavoriteChannels() {
        var favorites = getFavorites();
        var channels = getChannels();

        return channels.filter(function(c) {
            return favorites.indexOf(c.id) !== -1;
        });
    }

    /**
     * Search channels
     */
    function searchChannels(query) {
        if (!query) return [];

        var channels = getChannels();
        var lowerQuery = query.toLowerCase();

        return channels.filter(function(c) {
            return (c.name && c.name.toLowerCase().indexOf(lowerQuery) !== -1) ||
                   (c.category && c.category.toLowerCase().indexOf(lowerQuery) !== -1);
        });
    }

    /**
     * Generate unique ID
     */
    function generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get all IP servers
     */
    function getIPServers() {
        try {
            var stored = localStorage.getItem(IPSERVERS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error reading IP servers:', e);
            return [];
        }
    }

    /**
     * Save IP servers
     */
    function saveIPServers(servers) {
        try {
            localStorage.setItem(IPSERVERS_KEY, JSON.stringify(servers));
            return true;
        } catch (e) {
            console.error('Error saving IP servers:', e);
            return false;
        }
    }

    /**
     * Add IP server
     */
    function addIPServer(serverInfo) {
        var servers = getIPServers();
        serverInfo.id = generateId();
        serverInfo.createdAt = new Date().toISOString();
        serverInfo.type = 'ip-server';
        servers.push(serverInfo);
        saveIPServers(servers);
        return serverInfo;
    }

    /**
     * Delete IP server
     */
    function deleteIPServer(id) {
        var servers = getIPServers();
        var filtered = servers.filter(function(s) {
            return s.id !== id;
        });
        saveIPServers(filtered);

        // Also delete associated channels
        var channels = getChannels();
        var filteredChannels = channels.filter(function(c) {
            return c.playlistId !== id && c.serverId !== id;
        });
        saveChannels(filteredChannels);

        return true;
    }

    /**
     * Get subtitle servers
     */
    function getSubtitleServers() {
        try {
            var stored = localStorage.getItem(SUBTITLE_SERVERS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error reading subtitle servers:', e);
            return [];
        }
    }

    /**
     * Save subtitle servers
     */
    function saveSubtitleServers(servers) {
        try {
            localStorage.setItem(SUBTITLE_SERVERS_KEY, JSON.stringify(servers));
            return true;
        } catch (e) {
            console.error('Error saving subtitle servers:', e);
            return false;
        }
    }

    /**
     * Add subtitle server
     */
    function addSubtitleServer(serverInfo) {
        var servers = getSubtitleServers();
        serverInfo.id = generateId();
        serverInfo.createdAt = new Date().toISOString();
        servers.push(serverInfo);
        saveSubtitleServers(servers);
        return serverInfo;
    }

    /**
     * Delete subtitle server
     */
    function deleteSubtitleServer(id) {
        var servers = getSubtitleServers();
        var filtered = servers.filter(function(s) {
            return s.id !== id;
        });
        saveSubtitleServers(filtered);
        return true;
    }

    /**
     * Save subtitle for channel
     */
    function saveChannelSubtitle(channelId, language, subtitle) {
        try {
            var allSubtitles = localStorage.getItem(CHANNEL_SUBTITLES_KEY);
            var subtitles = allSubtitles ? JSON.parse(allSubtitles) : {};

            if (!subtitles[channelId]) {
                subtitles[channelId] = {};
            }

            subtitles[channelId][language] = subtitle;
            localStorage.setItem(CHANNEL_SUBTITLES_KEY, JSON.stringify(subtitles));
            return true;
        } catch (e) {
            console.error('Error saving channel subtitle:', e);
            return false;
        }
    }

    /**
     * Get subtitle for channel
     */
    function getChannelSubtitle(channelId, language) {
        try {
            var allSubtitles = localStorage.getItem(CHANNEL_SUBTITLES_KEY);
            if (!allSubtitles) return null;

            var subtitles = JSON.parse(allSubtitles);
            if (subtitles[channelId] && subtitles[channelId][language]) {
                return subtitles[channelId][language];
            }
            return null;
        } catch (e) {
            console.error('Error reading channel subtitle:', e);
            return null;
        }
    }

    /**
     * Get all subtitles for channel
     */
    function getChannelSubtitles(channelId) {
        try {
            var allSubtitles = localStorage.getItem(CHANNEL_SUBTITLES_KEY);
            if (!allSubtitles) return {};

            var subtitles = JSON.parse(allSubtitles);
            return subtitles[channelId] || {};
        } catch (e) {
            console.error('Error reading channel subtitles:', e);
            return {};
        }
    }

    /**
     * Add local subtitle
     */
    function addLocalSubtitle(subtitle) {
        try {
            var localSubs = getLocalSubtitles();
            subtitle.id = generateId();
            subtitle.addedAt = new Date().toISOString();
            localSubs.push(subtitle);
            localStorage.setItem(LOCAL_SUBTITLES_KEY, JSON.stringify(localSubs));
            return subtitle;
        } catch (e) {
            console.error('Error saving local subtitle:', e);
            return null;
        }
    }

    /**
     * Get local subtitles
     */
    function getLocalSubtitles() {
        try {
            var stored = localStorage.getItem(LOCAL_SUBTITLES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error reading local subtitles:', e);
            return [];
        }
    }

    /**
     * Delete local subtitle
     */
    function deleteLocalSubtitle(id) {
        try {
            var localSubs = getLocalSubtitles();
            var filtered = localSubs.filter(function(s) {
                return s.id !== id;
            });
            localStorage.setItem(LOCAL_SUBTITLES_KEY, JSON.stringify(filtered));
            return true;
        } catch (e) {
            console.error('Error deleting local subtitle:', e);
            return false;
        }
    }

    /**
     * Clear all data
     */
    function clearAll() {
        localStorage.removeItem(PLAYLISTS_KEY);
        localStorage.removeItem(CHANNELS_KEY);
        localStorage.removeItem(FAVORITES_KEY);
        localStorage.removeItem(IPSERVERS_KEY);
        localStorage.removeItem(SUBTITLE_SERVERS_KEY);
        localStorage.removeItem(CHANNEL_SUBTITLES_KEY);
        localStorage.removeItem(LOCAL_SUBTITLES_KEY);
        return true;
    }

    // Public API
    return {
        getPlaylists: getPlaylists,
        savePlaylists: savePlaylists,
        addPlaylist: addPlaylist,
        deletePlaylist: deletePlaylist,
        getChannels: getChannels,
        saveChannels: saveChannels,
        addChannels: addChannels,
        getChannelsByCategory: getChannelsByCategory,
        getCategories: getCategories,
        getFavorites: getFavorites,
        addFavorite: addFavorite,
        removeFavorite: removeFavorite,
        isFavorite: isFavorite,
        getFavoriteChannels: getFavoriteChannels,
        searchChannels: searchChannels,
        getIPServers: getIPServers,
        saveIPServers: saveIPServers,
        addIPServer: addIPServer,
        deleteIPServer: deleteIPServer,
        getSubtitleServers: getSubtitleServers,
        saveSubtitleServers: saveSubtitleServers,
        addSubtitleServer: addSubtitleServer,
        deleteSubtitleServer: deleteSubtitleServer,
        saveChannelSubtitle: saveChannelSubtitle,
        getChannelSubtitle: getChannelSubtitle,
        getChannelSubtitles: getChannelSubtitles,
        addLocalSubtitle: addLocalSubtitle,
        getLocalSubtitles: getLocalSubtitles,
        deleteLocalSubtitle: deleteLocalSubtitle,
        clearAll: clearAll
    };
})();
