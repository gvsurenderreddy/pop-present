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
    'file://*',
    'http://*/*',
    'https://*/*'
];
var urlsGoogle = [
    '*://docs.google.com/*',
    '*://docs.google.com/a/google.com/*',
    '*://docs.google.com/presentation/d/*',
    '*://docs.google.com/a/google.com/presentation/d/*',
    '*://spec.googleplex.com/*',
    '*://folio.googleplex.com/*',
    '*://plus.google.com/hangouts/_/present/*',
    '*://plus.google.com/hangouts/*'
];

var parent = chrome.contextMenus.create({
    title               : 'Drive Present',
    documentUrlPatterns : urls
});

var item1 = chrome.contextMenus.create({
    type     : 'normal',
    id       : 'open-window',
    title    : 'Popout new window',
    parentId : parent
});

var item2 = chrome.contextMenus.create({
    type     : 'normal',
    id       : 'open-present',
    title    : 'Popout new window and screen-share',
    parentId : parent
});

var separator = chrome.contextMenus.create({
    type                : 'separator',
    parentId            : parent,
    documentUrlPatterns : [urlsGoogle[2], urlsGoogle[3]]
});

var item3 = chrome.contextMenus.create({
    type                : 'normal',
    id                  : 'edit-present',
    title               : 'Present in current window',
    parentId            : parent,
    documentUrlPatterns : [urlsGoogle[2], urlsGoogle[3]]
});





// -----------------------------------------------------------------------------
//
// Methods
//
// -----------------------------------------------------------------------------
function createUrl(url, suffix) {
    return url.substring(0, url.lastIndexOf('/')) + suffix;
}

/**
 * create a tab within windowId
 *
 * @param  {Number} windowId
 * @param  {Tab} tab
 *
 */
function createTab(windowId, tab) {
    // open tab in windowId
    chrome.tabs.create({
        windowId : windowId,
        url      : tab.url,
        active   : true
    }, null);

    // make the windowId come to front
    chrome.windows.update(windowId, {
        focused  : true
    }, null);

    // remove tab from the window it whence came
    chrome.tabs.remove(tab.id);
}

/**
 * create a window the size of the screen with a GVC tab
 * set var present; to new window
 *
 * @param  {[type]} tab [description]
 *
 */
function createPresent(tab) {
    chrome.system.display.getInfo(function(displayInfo) {
        // open GVC in new window and
        // open tab in this window
        chrome.windows.create({
            type   : 'normal',
            // FIX: this seems incredibly backwards... right?
            url    : ['https' + urlsGoogle[6].replace(/\*/g, '') + 'google.com', tab.url],
            top    : 0,
            left   : 0,
            width  : displayInfo[0].bounds.width,
            height : displayInfo[0].bounds.height
        },
        function(window) {
            setPresentId(window.id);
        });

        // remove tab from the window it whence came
        chrome.tabs.remove(tab.id);
    });
}

// -----------------------------------------------------------------------------
/**
 * look to see if GVC window is already open
 * set that to the present window id
 *
 * @param  {Function} callback
 *
 */
function findPresent(callback) {
    // reset var present;
    setPresentId(-1);

    // check every tab for an
    // open GVC url
    chrome.tabs.query({
        url : [urlsGoogle[6], urlsGoogle[7]]
    },
    function(tabs) {
        tabs.forEach(function(tab) {
            chrome.windows.update(tab.windowId, {
                // focused : true
                drawAttention : true
            });

            setPresentId(tab.windowId);

            // move GVC tab to far left
            chrome.tabs.move(tab.id, {
                windowId : tab.windowId,
                index    : 0
            }, null);

            if (callback) {
                callback(tab, present);
            }
        });
    });
}

// -----------------------------------------------------------------------------

/**
 * on selection of a context menu item—
 * get tab of current active window
 * and take care of it according to action
 *
 * @param  {[type]} info [description]
 * @param  {Tab} tab
 *
 */
function onSelected(info, tab) {
    chrome.tabs.query({
        // last focused...?
        lastFocusedWindow : true,
        active            : true
    },
    function(tabs) {
        if (info.menuItemId === 'open-window') {
            tabs[0].url = toggleSlidePresentMode(tabs[0].url);

            chrome.windows.create({
                type : 'popup',
                url  :  tabs[0].url
            }, null);
        }
        else if (info.menuItemId === 'open-present') {
            tabs[0].url = toggleSlidePresentMode(tabs[0].url);

            if (present === -1) {
                createPresent(tabs[0]);
            }
            else {
                createTab(present, tabs[0]);
            }
        }
        else if (info.menuItemId === 'edit-present') {
            chrome.tabs.update(tabs[0].id, {
                url : toggleSlideEditPresent(tabs[0].url)
            }, null);
        }

        // toggleSlideEditPresent(tabs[0].url);
    });
}

// -----------------------------------------------------------------------------
function onRemove(windowId) {
    if (windowId === present) {
       setPresentId(-1);
   }
}


// -----------------------------------------------------------------------------

//
// Sets
//
/**
 * set var present;
 *
 * @param {Number} val the window id of the tab with GVC url
 *
 */
function setPresentId(val) {
    present = val;

    chrome.contextMenus.update('open-present', {
        title: (val === -1)
            ? 'Popout new window and screen-share'
            : 'Add to screen-share window'
    }, null);
}

function toggleSlidePresentMode(url) {
    return (url.match(/presentation/))
        ? createUrl(url, '/present')
        : url;
}

/**
 * set menu item 'edit-present' depending
 * on state of current Slides presentation (tab)
 *
 * @param {String} url
 *
 * @return {String} updated url
 *
 */
function toggleSlideEditPresent(url) {
    var suffix = url.substr(url.lastIndexOf('/'));
    var isPresent = (suffix.indexOf('present') != -1);

    chrome.contextMenus.update('edit-present', {
        title: (isPresent)
            ? 'Edit in current window'
            : 'Present in current window'
    }, null);

    return (isPresent)
        ? createUrl(url, '/edit')
        : createUrl(url, '/present');
}


// -----------------------------------------------------------------------------

//
// Gets
//
function getTabUrl(callback) {
    return chrome.tabs.getSelected(null, function(tab) {
        if (callback) {
            callback(tab.url);
        }
        return tab.url;
    });
}



// -----------------------------------------------------------------------------
//
// Events
//
// -----------------------------------------------------------------------------
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    onSelected(info, tab);
});

// -----------------------------------------------------------------------------
chrome.windows.onRemoved.addListener(function(windowId) {
    // findPresent();
    onRemove(windowId);
});
chrome.tabs.onRemoved.addListener(function(tabId, windowId) {
    // findPresent();
    onRemove(windowId);
});

// -----------------------------------------------------------------------------
chrome.tabs.onActivated.addListener(function(tabId, windowId) {
    findPresent();
    getTabUrl(toggleSlideEditPresent);
});
chrome.tabs.onUpdated.addListener(function() {
    findPresent();
    getTabUrl(toggleSlideEditPresent);
});


