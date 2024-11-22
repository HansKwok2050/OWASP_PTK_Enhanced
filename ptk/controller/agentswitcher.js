/* Author: Kwok Wing Hong */

export class ptk_controller_agentswitcher {

    async init() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_agentswitcher", type: "init" })
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async toggle_agentSwitcher() {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_agentswitcher", type: "toggle_agentSwitcher"})
            .then(response => {
                return response
            }).catch(e => e)
    }

    async update_agentPreset(type) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_agentswitcher", type: "update_agentPreset", content: type})
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }

    async update_agentCustom(string) {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_agentswitcher", type: "update_agentCustom", content: string})
            .then(function (result) {
                Object.assign(self, result)
                return self
            }).catch(e => e)
    }
}