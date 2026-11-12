import UIKit
import Capacitor
import WebKit

/// 自定义桥接控制器：覆写 WebView 配置，
/// 允许视频内联播放 / 自动播放 / 画中画，适配影视站点。
class MainViewController: CAPBridgeViewController {

    override func instanceDescriptor() -> InstanceDescriptor {
        let descriptor = super.instanceDescriptor()
        descriptor.webViewConfiguration.allowsInlineMediaPlayback = true
        descriptor.webViewConfiguration.mediaTypesRequiringUserActionForPlayback = []
        descriptor.webViewConfiguration.allowsPictureInPictureMediaPlayback = true
        descriptor.webViewConfiguration.allowsAirPlayForMediaPlayback = true
        if #available(iOS 14.0, *) {
            descriptor.webViewConfiguration.defaultWebpagePreferences.allowsContentJavaScript = true
        }
        return descriptor
    }
}
