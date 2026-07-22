function api(path, method = "GET", body = null) {
    let options = { method };

    if (body) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(body);
    }

    return fetch("/index.php?path=" + path, options)
        .then(res => res.json());
}

function toast(msg) {
    alert(msg); // for now, simple. Later replace with beautiful toast.
}
