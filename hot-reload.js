/**
 * Hot-reload functionality via Server-Sent Events
 * Automatically reloads the page when relevant exhibits change
 */

(function() {
    'use strict';
    
    // Check if we're on an exhibit page or the main page
    const currentPath = window.location.pathname;
    const isExhibitPage = currentPath.includes('/exhibits/');
    let currentExhibit = null;
    
    if (isExhibitPage) {
        // Extract exhibit name from path like /exhibits/exhibit-name/index.html
        const pathParts = currentPath.split('/');
        const exhibitsIndex = pathParts.indexOf('exhibits');
        if (exhibitsIndex !== -1 && pathParts[exhibitsIndex + 1]) {
            currentExhibit = pathParts[exhibitsIndex + 1];
        }
    }
    
    // Create and style the update toast
    let updateToast = null;
    
    function showUpdateToast() {
        if (updateToast) return; // Already showing
        
        updateToast = document.createElement('div');
        updateToast.innerHTML = '🔄 updating...';
        updateToast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: #fff;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: hotreload-fadein 0.3s ease-out;
        `;
        
        // Add CSS animation
        if (!document.querySelector('#hotreload-styles')) {
            const style = document.createElement('style');
            style.id = 'hotreload-styles';
            style.textContent = `
                @keyframes hotreload-fadein {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(updateToast);
    }
    
    function reloadPage() {
        showUpdateToast();
        
        // Smooth reload after a brief delay
        setTimeout(() => {
            window.location.reload();
        }, 800);
    }
    
    // Connect to the SSE endpoint
    function connectToUpdates() {
        const eventSource = new EventSource('/api/updates');
        
        eventSource.onopen = function() {
            console.log('🔄 Hot-reload connected');
        };
        
        eventSource.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                
                switch (data.type) {
                    case 'connected':
                        console.log('🔄 Hot-reload ready');
                        break;
                        
                    case 'exhibit_changed':
                        const changedExhibit = data.exhibit;
                        console.log(`📁 Exhibit changed: ${changedExhibit}`);
                        
                        // Determine if we should reload
                        let shouldReload = false;
                        
                        if (isExhibitPage) {
                            // On exhibit pages, only reload if THIS exhibit changed
                            shouldReload = changedExhibit === currentExhibit;
                        } else {
                            // On main page, reload for any exhibit change
                            shouldReload = true;
                        }
                        
                        if (shouldReload) {
                            console.log('🔄 Reloading page...');
                            reloadPage();
                        }
                        break;
                        
                    case 'heartbeat':
                        // Silent heartbeat to keep connection alive
                        break;
                        
                    default:
                        console.log('🔄 Unknown update type:', data.type);
                }
            } catch (error) {
                console.warn('🔄 Hot-reload: Failed to parse update event', error);
            }
        };
        
        eventSource.onerror = function(error) {
            console.warn('🔄 Hot-reload connection error, retrying in 5s...', error);
            eventSource.close();
            
            // Reconnect after 5 seconds
            setTimeout(connectToUpdates, 5000);
        };
    }
    
    // Start hot-reload when the page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', connectToUpdates);
    } else {
        connectToUpdates();
    }
    
    console.log('🔄 Hot-reload script loaded');
})();