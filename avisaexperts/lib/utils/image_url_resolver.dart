import '../config/app_config.dart';

/// Default avatar used when no image path is provided.
const String _defaultAvatarUrl = '${AppConfig.staticAssetBase}/images/user/avatar.webp';

/// Normalizes image paths from the backend so the app always tries to load a
/// valid URL.
///
/// Rules:
/// * `null` / empty -> default avatar.
/// * Already starts with `http://` or `https://` -> returned as-is.
/// * Starts with `assets/` -> returned as-is (local asset).
/// * Old PHP paths like `img/...` or `/img/...` are remapped to the new
///   `/images/user/` folder on the static asset host.
/// * Relative paths get the static asset base prepended.
/// * Absolute paths starting with `/` also get the static asset base prepended.
String resolveImageUrl(String? path, {String? fallbackUrl}) {
  if (path == null || path.trim().isEmpty) {
    return fallbackUrl ?? _defaultAvatarUrl;
  }

  String normalized = path.trim().replaceAll(r'\', '/');

  // Already a valid network URL. If it points at the old PHP domain, keep the
  // path but switch to the new static host so the `/img/` alias works.
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    final oldDomain = RegExp(r'^https?://avisaexperts\.com(\/.*)?$', caseSensitive: false);
    final match = oldDomain.firstMatch(normalized);
    if (match != null) {
      return '${AppConfig.staticAssetBase}${match.group(1) ?? ''}';
    }
    return normalized;
  }

  // Local asset.
  if (normalized.startsWith('assets/')) {
    return normalized;
  }

  final lower = normalized.toLowerCase();
  if (lower == 'default_avatar.png' || lower == '/default_avatar.png') {
    return fallbackUrl ?? _defaultAvatarUrl;
  }

  // Remap old PHP `img/` folder to the new React images folder.
  if (normalized.startsWith('img/') || normalized.startsWith('/img/')) {
    final fileName = normalized.replaceAll(RegExp(r'^/?img/'), '');
    return '${AppConfig.staticAssetBase}/images/user/$fileName';
  }

  // Prepend the static asset host to remaining relative/absolute paths.
  if (normalized.startsWith('/')) {
    return '${AppConfig.staticAssetBase}$normalized';
  }
  return '${AppConfig.staticAssetBase}/$normalized';
}
