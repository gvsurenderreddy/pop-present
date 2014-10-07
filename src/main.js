/*
 * Drive Present
 * main.js
 *
 * Ken Frederick
 * ken.frederick@gmx.de
 *
 * http://kennethfrederick.de/
 * http://blog.kennethfrederick.de/
 *
 */


// -----------------------------------------------------------------------------
//
// Properties
//
// -----------------------------------------------------------------------------
var urls = [
    '*://docs.google.com/*',
    '*://docs.google.com/a/google.com/*',
    '*://docs.google.com/presentation/d/*',
    '*://docs.google.com/a/google.com/presentation/d/*'
];

var parent = chrome.contextMenus.create({
    title:               'Drive Present',
    documentUrlPatterns: urls
});

var child1 = chrome.contextMenus.create({
    type:     'normal',
    id:       'open-window',
    title:    'Popout new window',
    parentId: parent
});

var child2 = chrome.contextMenus.create({
    type:     'normal',
    id:       'open-present',
    title:    'Popout new window and screen-share',
    parentId: parent
});

var separator = chrome.contextMenus.create({
    type:                'separator',
    parentId:            parent,
    documentUrlPatterns: [urls[2], urls[3]]
});

var child3 = chrome.contextMenus.create({
    type:                'normal',
    id:                  'edit-present',
    title:               'Edit in current window',
    parentId:            parent,
    documentUrlPatterns: [urls[2], urls[3]]
});



// -----------------------------------------------------------------------------
//
// Methods
//
// -----------------------------------------------------------------------------
function createUrl(url, suffix) {
    return url.substring(0, url.lastIndexOf('/')) + suffix;
};


// -----------------------------------------------------------------------------
//
// Events
//
// -----------------------------------------------------------------------------
function onSelect(info, tab) {
    chrome.tabs.query({
        currentWindow: true,
        active:        true
    },
    function(tabs) {
        var url = tabs[0].url;
        var id = tabs[0].id;

        if (info.menuItemId === 'open-window') {
            url = (url.match(/presentation/))
                ? createUrl(tabs[0].url, '/present')
                : url;

            chrome.windows.create({
                type: 'popup',
                url:  url
            },
            null);
        }
        else if (info.menuItemId === 'open-present') {
            url = (url.match(/presentation/))
                ? createUrl(tabs[0].url, '/present')
                : url;

            chrome.windows.create({
                type: 'normal',
                url: [
                     url,
                     'https://plus.google.com/hangouts/_/present/google.com'
                ]
            },
            null);
        }
        else if (info.menuItemId === 'edit-present') {
            url = createUrl(tabs[0].url, '/edit');

            chrome.tabs.update(
                id,
                {
                    url:  url
                },
                null
            );
        }

    });

};

chrome.contextMenus.onClicked.addListener(onSelect);

