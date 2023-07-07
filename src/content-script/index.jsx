import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '../css/index.css';
window.onload = () => {
    waitForElm('.html5-video-container').then(() => {
        // const video = document.getElementsByClassName("html5-main-video")[0]
        document.addEventListener("fullscreenchange", function (event) {
            if (document.fullscreenElement) {
                document.querySelector('.html5-video-container').insertAdjacentHTML("beforeend", `
                <div style="overflow: hidden; position: absolute; z-index: 1111; width: 100vw; height: 100vh; right: 0">
                    <div style="display: flex; justify-content: right;">
                        <div id="react-target" style="margin-top: 100px"></div>
                    </div>
                </div>
                `)
                const root = ReactDOM.createRoot(document.getElementById('react-target'));
                root.render(<Overlay />)
            }
            else {
                const element = document.getElementById("react-target");
                element.remove();
            }
        });

    })
}

function waitForElm(selector) {

    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function Overlay() {
    if (window.location.hostname === "www.youtube.com") {
        if (window.location.search !== "" && window.location.search.includes("v=")) {
            const [url, setUrl] = useState(window.location.href);
            useEffect(() => {
                setUrl(window.location.href);
            }, [window.location.href])
            return (
                <div>{url}</div>
            )
        }
    }
}