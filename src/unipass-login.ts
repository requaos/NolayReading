import {getAddress} from './localdata'
export function is_login(): boolean {
    var unipass_data = getAddress();
    if (unipass_data)  return true;
    return false;
}

export function is_logining(): boolean {
    var unipass_data = localStorage.getItem("unipass_login");
    if (unipass_data)  return true;
    return false;
}

export function set_logining() {
    localStorage.setItem("unipass_login", "true");
}

export function set_unlogining() {
    localStorage.removeItem("unipass_login");
}