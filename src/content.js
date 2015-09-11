/* var hasButton = false;


chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        // if (request.text && (request.text === 'getDOM')) {

        console.log('request');

        // var titlebarButtons = document.getElementsByClassName('goog-inline-block'); //'docs-titlebar-buttons');
        // var titlebarButtons = document.getElementsByClassName('docs-titlebar-buttons');
        var titlebarButtons = document.getElementById('docs-presence-container');
        if (titlebarButtons !== null && !hasButton) {

            // var span = document.createElement('span');
            // span.className = 'goog-inline-block punch-start-presentation-icon';
            // span.innerHTML = '&nbsp;';

            // var icon = document.createElement('div');
            // icon.className = 'goog-flat-menu-button-dropdown goog-inline-block';
            // icon['aria-hidden'] = true;
            // icon.innertHTML = '&nbsp;';

            // var iconContainer = document.createElement('div');
            // iconContainer.className = 'goog-flat-menu-button-caption goog-inline-block';

            var title = document.createTextNode('Boom');

            var button = document.createElement('div');
            button.role = 'button';
            button.id = 'docs-drive-present-button';
            // button.className = 'goog-inline-block jfk-button jfk-button-standard jfk-button-collapse-right docs-titlebar-button';
            // button.className = 'goog-flat-menu-button-collapse-left docs-titlebar-button goog-flat-menu-button goog-inline-block';
            button.className = 'goog-inline-block jfk-button jfk-button-standard docs-titlebar-button jfk-button-clear-outline';
            button.setAttribute('aria-disabled', false);
            button.setAttribute('aria-pressed', false);
            button.setAttribute('aria-expanded', false);
            button.setAttribute('aria-haspopup', true);
            button.setAttribute('tabindex', 0);
            button.setAttribute('data-tooltip', 'Drive-Present');
            button.setAttribute('aria-label', 'Drive-Present');
            button.value = 'undefined';
            button.style = '-webkit-user-select: none;';
            // button.appendChild(span);

            // titlebarButtons[0].appendChild(button);
            titlebarButtons.insertBefore(button, titlebarButtons.childNodes[0]);
            // button.appendChild(iconContainer);
            button.appendChild(title);
            // iconContainer.appendChild(icon);

            hasButton = true;
        }



        //     sendResponse({
        //         dom: document.body.innertHTML
        //     });
        // }
    }
);


var Popup = function() {
    var container = document.createElement('div');
    container.className = 'docos-streampane-header';

    var button = new Button();



    <div class="docos-streampane-header">
        <div aria-label="Add a comment" >
            <div class="docos-new-comment-icon docos-icon-insert-comment docos-icon"></div>
            Comment
        </div>
    </div>


}

var Button = function(attributes) {
    var title = document.createTextNode('Title');

    var button = document.createElement('div');
    button.setAttribute('role', 'button');
    button.className = 'docos-new-comment-button jfk-button jfk-button-standard';
    button.setAttribute('aria-disabled', false);
    button.setAttribute('tabindex', 0);
    button.setAttribute('data-tooltip', 'Add a comment');
    button.setAttribute('aria-label', 'Add a comment');
    button.style = '-webkit-user-select: none;';

    button.appendChild(title);

    return button;
};



*/