import { Global } from "./global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ScrollViewCell extends cc.Component {

    @property(cc.Toggle)
    checkButton_: cc.Toggle = null;

    @property(cc.Label)
    label_: cc.Label = null;

    bezierId_: any;

    onLoad () {
        Global.eventListener.on("CHOOSE_BEZIER", (id: any) => {
            this.chooseBezier(id);
        });
        this.checkButton_.interactable = false;
    }

    chooseBezier(id: any) {
        this.checkButton_.isChecked = false;
        if (id === this.bezierId_) {
            this.checkButton_.isChecked = true;
        }
    }

    init(data: { bezierId: any; }) {
        this.bezierId_ = data.bezierId;
        this.label_.string = this.bezierId_;
    }

    onButtonClick(event: any, customData: any) {
        Global.eventListener.fire("CHOOSE_BEZIER", this.bezierId_);
    }

    getCellId() {
        return this.bezierId_;
    }
}
