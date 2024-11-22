/* Author: Kwok Wing Hong */

export class ptk_controller_fuzzer {

    async init() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_fuzzer", type: "init" })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async toggle_allow(type) {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_fuzzer", type: "toggle_allow", content: type})
            .then(response => {
                return response
            }).catch(e => e)
    }
}