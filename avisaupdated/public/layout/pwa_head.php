<?php $p = isset($pwaPath) ? $pwaPath : ''; ?>
<link rel="manifest" href="<?= $p ?>manifest.json">
<meta name="theme-color" content="#667eea">
<link rel="apple-touch-icon" href="<?= $p ?>assets/icons/icon-192.png">

<script>
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('<?= $p ?>sw.js')
                .then(reg => {
                    console.log('SW Registered', reg.scope);
                })
                .catch(err => {
                    console.error('SW Registration Failed:', err);
                });
        });
    }
</script>
