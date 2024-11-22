/* Author: Kwok Wing Hong */

export class ptk_controller_spider {

    async init() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_spider", type: "init" })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async update_depth(depth) {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_spider", type: "update_depth", content: depth })
            .then(response => {
                return response
            }).catch(e => e)
    }

    async update_url(url) {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_spider", type: "update_url", content: url})
            .then(response => {
                return response
            }).catch(e => e)
    }

    async start_scan(url) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_spider", type: "start_scan", content: url})
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async stop_scan() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_spider", type: "stop_scan"})
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async lock_url(url) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_spider", type: "lock_url", content: url})
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async unlock_url() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_spider", type: "unlock_url" })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async export_result() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_spider", type: "export_result" })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async clear_all() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_spider", type: "clear_all" })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }
}