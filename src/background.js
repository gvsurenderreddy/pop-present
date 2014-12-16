/*
 * Drive Present
 * background.js
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
var present = -1;

var urls = [
    '*://docs.google.com/*',
    '*://docs.google.com/a/google.com/*',
    '*://docs.google.com/presentation/d/*',
    '*://docs.google.com/a/google.com/presentation/d/*',
    '*://spec.googleplex.com/*',
    '*://folio.googleplex.com/*',
    'file://*'
];

var parent = chrome.contextMenus.create({
    title:               'Drive Present',
    documentUrlPatterns: urls
});

var item1 = chrome.contextMenus.create({
    type:     'normal',
    id:       'open-window',
    title:    'Popout new window',
    parentId: parent
});

var item2 = chrome.contextMenus.create({
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

var item3 = chrome.contextMenus.create({
    type:                'normal',
    id:                  'edit-present',
    title:               'Present in current window',
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

function createTab(windowId, url) {
    chrome.tabs.create(
        {
            windowId: windowId,
            url:      url,
            active:   true
        },
        null
    );
    chrome.windows.update(
        windowId,
        {
            focused: true
        },
        null
    );
};

// -----------------------------------------------------------------------------
function onSelected(info, tab) {
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
            null    );
        }
        else if (info.menuItemId === 'open-present') {
            url = (url.match(/presentation/))
                ? createUrl(tabs[0].url, '/present')
                : url;

            if (present === -1) {
                chrome.windows.create({
                    type: 'normal',
                    url: [
                        'https://plus.google.com/hangouts/_/present/google.com',
                        url
                    ]
                },
                function(window) {
                    setPresentId(window.id);
                });
            }
            else {
                createTab(present, url);
            }
        }
        else if (info.menuItemId === 'edit-present') {
            url = setPresentEdit(url);

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

// -----------------------------------------------------------------------------
function setPresentId(val) {
    present = val;
    chrome.contextMenus.update(
        'open-present', {
            title: (val === -1)
                ? 'Popout new window and screen-share'
                : 'Add to screen-share window'
        },
        null
    );
};

function setPresentEdit(url) {
    var suffix = url.substr(url.lastIndexOf('/'));
    var isPresent = (suffix.indexOf('present') != -1);
    chrome.contextMenus.update(
        'edit-present', {
            title: (isPresent)
                ? 'Edit in current window'
                : 'Present in current window'
        },
        null
    );

    return (isPresent)
        ? createUrl(url, '/edit')
        : createUrl(url, '/present');
};

// -----------------------------------------------------------------------------
function getTabUrl() {
    return chrome.tabs.getSelected(null, function(tab) {
        var url = tab.url;
        setPresentEdit(url);

        return url;
    });
};



// -----------------------------------------------------------------------------
//
// Events
//
// -----------------------------------------------------------------------------
chrome.contextMenus.onClicked.addListener(onSelected);


// -----------------------------------------------------------------------------
chrome.windows.onRemoved.addListener(function(windowId) {
   if (windowId === present) {
       setPresentId(-1);
   }
});


// -----------------------------------------------------------------------------
chrome.tabs.onActivated.addListener(function(tabId, windowId) {
    getTabUrl();
});
chrome.tabs.onUpdated.addListener(function() {
    getTabUrl();
});




