const St = imports.gi.St;
const Soup = imports.gi.Soup;
const Main = imports.ui.main;

// TODO: allow url to be set by user, or have list of known spaces,
// or get list from http://hackerspaces.nl/spaceapi/

// TODO: fix LOLO_URL when it's actually running
const LOLO_URL = 'http://galileo.fedorapeople.org/status.json';

const _httpSession = new Soup.SessionAsync();

let button, request, icon;

/*
 * Performs the AJAX request.
 */
function _getStatus(url, callback) {

    let here = this;
    request = Soup.Message.new('GET', url);
    _httpSession.queue_message(request, function(_httpSession, request) {
	if (request.status_code !== 200) {
            callback(request.status_code, null);
            return;
	}
	let jsondata = JSON.parse(request.response_body.data);
	callback.call(here, jsondata);
    });
}

/*
 * Sets icon based on space open or closed.
 */
function _statusInfo() {

    _getStatus(LOLO_URL, function(loloStatus) {
	log("Space open: " + loloStatus.open);
	if (loloStatus.open) {
	    icon = new St.Icon({ icon_name: 'changes-allow-symbolic',
                             style_class: 'system-status-icon' });
	    button.set_child(icon);
	} else {
	    icon = new St.Icon({ icon_name: 'changes-prevent-symbolic',
                             style_class: 'system-status-icon' });
	    button.set_child(icon);
	}
    });
}

/*
 * Main initialization function
 */
function init() {

    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });

    _statusInfo();
    button.connect('button-press-event', _statusInfo);
}

/*
 * Called when enabling extension
 */
function enable() {

    Main.panel._rightBox.insert_child_at_index(button, 0);
}

/*
 * Called when disabling extension
 */
function disable() {

    Main.panel._rightBox.remove_child(button);
}
