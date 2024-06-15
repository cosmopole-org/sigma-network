
import BoxControl from "./BoxControl"
import ButtonControl from "./ButtonControl"
import CardControl from "./CardControl"
import TabsControl from "./TabsControl"
import PrimaryTabControl from "./PrimaryTabControl"
import TextControl from "./TextControl"
import HtmlControl from "./HtmlControl"
import BodyControl from "./BodyControl"
import ScriptControl from "./ScriptControl"
import ImageControl from "./ImageControl"
import FrameControl from "./FrameControl"

export default {
    [TextControl.TYPE]: TextControl,
    [ButtonControl.TYPE]: ButtonControl,
    [BoxControl.TYPE]: BoxControl,
    [CardControl.TYPE]: CardControl,
    [TabsControl.TYPE]: TabsControl,
    [PrimaryTabControl.TYPE]: PrimaryTabControl,
    [HtmlControl.TYPE]: HtmlControl,
    [BodyControl.TYPE]: BodyControl,
    [ScriptControl.TYPE]: ScriptControl,
    [ImageControl.TYPE]: ImageControl,
    [FrameControl.TYPE]: FrameControl
}
