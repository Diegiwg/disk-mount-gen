/** @type {HTMLFormElement} */
let formElement;

/** @type {HTMLInputElement} */
let descriptionElement;
/** @type {HTMLParagraphElement} */
let descriptionError;

/** @type {HTMLInputElement} */
let uuidElement;
/** @type {HTMLParagraphElement} */
let uuidError;

/** @type {HTMLInputElement} */
let mountPathElement;
/** @type {HTMLParagraphElement} */
let mountPathError;

/** @type {HTMLInputElement} */
let typeElement;
/** @type {HTMLParagraphElement} */
let typeError;

/** @type {HTMLAnchorElement} */
let submitButton;
/** @type {HTMLAnchorElement} */
let downloadButton;
/** @type {HTMLTextAreaElement} */
let outputArea;

const filesystemTypes = [
    "ext4",
    "ext3",
    "ext2",
    "xfs",
    "btrfs",
    "zfs",
    "f2fs",
    "reiserfs",
    "jfs",
    "nilfs",
    "udf",
];

(async () => {
    if (!loadElements()) {
        console.error("Failed to load elements");
        return;
    }

    submitButton.addEventListener("click", (event) => {
        event.preventDefault();

        resetErrors();

        const [description, uuid, mountPath, type] = checkData();

        if (!description || !uuid || !mountPath || !type) {
            console.error("Failed to check data");
            return;
        }

        const content = assembly(uuid, mountPath, description, type);

        outputArea.textContent = content;

        mountDownload(downloadButton, description, mountPath, content);
    });
})();

function loadElements() {
    formElement = document.querySelector("form");
    if (!formElement) {
        return;
    }

    descriptionElement = document.querySelector("#description");
    if (!descriptionElement) {
        return;
    }

    descriptionError = document.querySelector("#description-error");
    if (!descriptionError) {
        return;
    }

    uuidElement = document.querySelector("#uuid");
    if (!uuidElement) {
        return;
    }

    uuidError = document.querySelector("#uuid-error");
    if (!uuidError) {
        return;
    }

    mountPathElement = document.querySelector("#mount-path");
    if (!mountPathElement) {
        return;
    }

    mountPathError = document.querySelector("#mount-path-error");
    if (!mountPathError) {
        return;
    }

    typeElement = document.querySelector("#type");
    if (!typeElement) {
        return;
    }

    typeError = document.querySelector("#type-error");
    if (!typeError) {
        return;
    }

    submitButton = document.querySelector("#submit");
    if (!submitButton) {
        return;
    }

    downloadButton = document.querySelector("#download");
    if (!downloadButton) {
        return;
    }

    outputArea = document.querySelector("#output");
    if (!outputArea) {
        return;
    }

    return true;
}

function resetErrors() {
    descriptionError.textContent = "";
    uuidError.textContent = "";
    mountPathError.textContent = "";
    typeError.textContent = "";
    descriptionElement.classList.toggle("error", false);
    uuidElement.classList.toggle("error", false);
    mountPathElement.classList.toggle("error", false);
    typeElement.classList.toggle("error", false);
}

function checkData() {
    const formData = new FormData(formElement);
    const description = formData.get("description");
    const uuid = formData.get("uuid");
    const mountPath = formData.get("mount-path");
    const type = formData.get("type");

    let hasError = false;

    // DESCRIPTION
    if (!/^[a-zA-Z0-9\s]+$/.test(description)) {
        descriptionError.textContent =
            "Invalid description. Use only letters, numbers or spaces.";
        descriptionElement.classList.toggle("error", true);
        hasError = true;
    }

    // UUID
    if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
            uuid
        )
    ) {
        uuidError.textContent =
            "Invalid UUID. It must be in the format 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' where x is a hexadecimal digit.";
        uuidElement.classList.toggle("error", true);
        hasError = true;
    }

    // MOUNT_PATH
    if (!/^\/[a-zA-Z0-9_\-/]+$/.test(mountPath)) {
        mountPathError.textContent =
            "Invalid mount path. It must start with a '/' and can contain letters, numbers, hyphens, and slashes.";
        mountPathElement.classList.toggle("error", true);
        hasError = true;
    }

    // TYPE
    if (!filesystemTypes.includes(type)) {
        typeError.textContent =
            "Invalid type. Use one of: " +
            filesystemTypes.join(", ") +
            ".";
        typeElement.classList.toggle("error", true);
        hasError = true;
    }

    return hasError
        ? [null, null, null, null]
        : [description, uuid, mountPath, type];
}

/**
 *
 * @param {HTMLAnchorElement} element
 * @param {string} description
 * @param {string} mountPath
 * @param {string} content
 */
function mountDownload(element, description, mountPath, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    element.href = url;
    element.download = mountPath.replaceAll("/", "-").substring(1) + ".mount";
    element.title = "Download `" + description + "` Mount File";
    element.classList.toggle("disabled", !content);
}

/**
 * Make a mount unit file
 *
 * @param {string} UUID
 * @param {string} MOUNT_PATH
 * @param {string} DESCRIPTION
 * @param {string} TYPE
 * @param {string} OPTIONS
 * @param {string} WANTED_BY
 * @returns {string}
 */
function assembly(
    UUID,
    MOUNT_PATH,
    DESCRIPTION,
    TYPE = "ext4",
    OPTIONS = "defaults,rw,noatime",
    WANTED_BY = "multi-user.target"
) {
    return `[Unit]
Description=${DESCRIPTION}

[Mount]
What=/dev/disk/by-uuid/${UUID}
Where=${MOUNT_PATH}
Type=${TYPE}
Options=${OPTIONS}

[Install]
WantedBy=${WANTED_BY}`;
}
