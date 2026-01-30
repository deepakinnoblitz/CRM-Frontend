export function handleDirectPrint(url: string, onStart?: () => void, onEnd?: () => void) {
    let iframe = document.getElementById('direct-print-iframe') as HTMLIFrameElement;

    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'direct-print-iframe';
        iframe.style.visibility = 'hidden';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
    }

    if (onStart) onStart();

    iframe.onload = () => {
        if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }
        if (onEnd) onEnd();
    };

    iframe.src = url;
}

export function handleDownload(url: string, filename?: string, onStart?: () => void, onEnd?: () => void) {
    if (onStart) onStart();

    fetch(url, { credentials: 'include' })
        .then((response) => response.blob())
        .then((blob) => {
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            if (filename) {
                link.download = filename;
            }
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            if (onEnd) onEnd();
        })
        .catch((error) => {
            console.error('Download failed:', error);
            if (onEnd) onEnd();
        });
}
