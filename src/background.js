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

function createTab(windowId, url) {
    chrome.tabs.create({
        windowId : windowId,
        url      : url,
        active   : true
    }, null);

    chrome.windows.update(windowId, {
        focused  : true
    }, null);
}

function createPresent(url) {
    chrome.windows.create({
        type : 'normal',
        // FIX: this seems incredibly backwards... right?
        url  : ['https' + urlsGoogle[6].replace(/\*/g, '') + 'google.com', url]
    },
    function(window) {
        setPresentId(window.id);
    });
}

// -----------------------------------------------------------------------------
function onSelected(info, tab) {

    // look to see if hangout window is already open
    // set that to the present window id
    chrome.tabs.query({
        url : [urlsGoogle[6], urlsGoogle[7]]
    },
    function(tabs) {
        tabs.forEach(function(tab) {
            chrome.windows.update(tab.windowId, {
                focused : true
            });
            setPresentId(tab.windowId);
        });
    });

    // get tab of current active window
    // and take care of it according to action
    chrome.tabs.query({
        // currentWindow     : true,
        lastFocusedWindow : true,
        active            : true
    },
    function(tabs) {
        var page = tabs[0].url;
        var id = tabs[0].id;

        if (info.menuItemId === 'open-window') {
            page = (page.match(/presentation/))
                ? createUrl(tabs[0].url, '/present')
                : page;

            chrome.windows.create({
                type : 'popup',
                url  :  page
            }, null);
        }
        else if (info.menuItemId === 'open-present') {
            page = (page.match(/presentation/))
                ? createUrl(tabs[0].url, '/present')
                : page;

            if (present === -1) {
                createPresent(page);
            }
            else {
                createTab(present, page);
            }
        }
        else if (info.menuItemId === 'edit-present') {
            page = setPresentEdit(page);

            chrome.tabs.update(id, {
                url : page
            }, null);
        }


    });

}


// -----------------------------------------------------------------------------

//
// Sets
//
function setPresentId(val) {
    present = val;
    chrome.contextMenus.update('open-present', {
        title: (val === -1)
            ? 'Popout new window and screen-share'
            : 'Add to screen-share window'
    }, null);
}

function setPresentEdit(url) {
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
function getTabUrl() {
    // alert( document.getElementsByClassName('docs-titlebar-container')[0] );

    return chrome.tabs.getSelected(null, function(tab) {
        var url = tab.url;
        setPresentEdit(url);

        return url;
    });
}



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
    // chrome.tabs.sendMessage(
    //     tabId.tabId,
    //     {
    //         action: 'getDOM'
    //     },
    //     function(response) {
    //         console.log(response);
    //     }
    // );
});
chrome.tabs.onUpdated.addListener(function() {
    getTabUrl();
});




