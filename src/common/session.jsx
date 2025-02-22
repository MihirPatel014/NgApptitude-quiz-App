export const storeInSession = (key, value) => {
    sessionStorage.setItem(key, value);
}

export const lookInSession = (key) => {
    return sessionStorage.getItem(key);
}


export const removeFromSession = (key) => {
    return sessionStorage.removeItem(key);
}

export const logOutUser = () => {
    sessionStorage.clear();
}

export default { storeInSession, lookInSession, removeFromSession, logOutUser }