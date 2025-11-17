/**
 * M3U Playlist Parser
 * Parses M3U and M3U8 playlists
 */

var M3UParser = (function() {
    'use strict';

    /**
     * Parse M3U playlist content
     */
    function parse(content) {
        var lines = content.split('\n');
        var channels = [];
        var currentChannel = null;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();

            if (!line || line.startsWith('#EXTM3U')) {
                continue;
            }

            if (line.startsWith('#EXTINF:')) {
                // Parse channel info
                currentChannel = parseExtInf(line);
            } else if (line.startsWith('#EXTGRP:')) {
                // Parse group/category
                if (currentChannel) {
                    currentChannel.category = line.substring(8).trim();
                }
            } else if (line.startsWith('#')) {
                // Other directive, skip
                continue;
            } else if (line.length > 0 && currentChannel) {
                // This is the stream URL
                currentChannel.url = line;
                channels.push(currentChannel);
                currentChannel = null;
            }
        }

        return channels;
    }

    /**
     * Parse #EXTINF line
     */
    function parseExtInf(line) {
        var channel = {
            name: '',
            logo: '',
            category: 'Uncategorized',
            url: '',
            tvgId: '',
            tvgName: ''
        };

        // Extract attributes
        var attrPattern = /([a-z-]+)="([^"]*)"/gi;
        var match;

        while ((match = attrPattern.exec(line)) !== null) {
            var key = match[1].toLowerCase();
            var value = match[2];

            switch (key) {
                case 'tvg-id':
                    channel.tvgId = value;
                    break;
                case 'tvg-name':
                    channel.tvgName = value;
                    break;
                case 'tvg-logo':
                    channel.logo = value;
                    break;
                case 'group-title':
                    channel.category = value;
                    break;
            }
        }

        // Extract channel name (after last comma)
        var commaIndex = line.lastIndexOf(',');
        if (commaIndex !== -1) {
            channel.name = line.substring(commaIndex + 1).trim();
        }

        // If no name, try to extract from tvg-name
        if (!channel.name && channel.tvgName) {
            channel.name = channel.tvgName;
        }

        return channel;
    }

    /**
     * Fetch and parse remote M3U
     */
    function fetchAndParse(url) {
        return fetch(url)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to fetch playlist: ' + response.statusText);
                }
                return response.text();
            })
            .then(function(content) {
                return parse(content);
            });
    }

    /**
     * Validate M3U content
     */
    function validate(content) {
        if (!content || typeof content !== 'string') {
            return false;
        }

        // Should start with #EXTM3U or contain #EXTINF
        return content.indexOf('#EXTM3U') !== -1 ||
               content.indexOf('#EXTINF') !== -1;
    }

    /**
     * Get playlist info
     */
    function getPlaylistInfo(content) {
        var channels = parse(content);
        var categories = {};

        for (var i = 0; i < channels.length; i++) {
            var cat = channels[i].category || 'Uncategorized';
            if (!categories[cat]) {
                categories[cat] = 0;
            }
            categories[cat]++;
        }

        return {
            totalChannels: channels.length,
            categories: Object.keys(categories).length,
            categoryList: categories
        };
    }

    // Public API
    return {
        parse: parse,
        parseExtInf: parseExtInf,
        fetchAndParse: fetchAndParse,
        validate: validate,
        getPlaylistInfo: getPlaylistInfo
    };
})();
