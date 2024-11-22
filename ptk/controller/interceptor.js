/* Author: Kwok Wing Hong */

export class ptk_controller_interceptor {

    async init() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_interceptor", type: "init" })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async toggle_listener() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_interceptor", type: "toggle_listener" })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async toggle_interceptor() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_interceptor", type: "toggle_interceptor" })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async request_record(index) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_interceptor", type: "request_record", content: index })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async export_result() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_interceptor", type: "export_result" })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async clear_all() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_interceptor", type: "clear_all" })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }
}