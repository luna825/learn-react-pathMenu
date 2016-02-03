import React from 'react'
import ReactDOM from 'react-dom'
import range from 'lodash.range';
import {Motion, spring,presets,StaggeredMotion} from 'react-motion';

//1弧度的值
const DEG_TO_RAD = 0.0174533;
//主按钮和子按钮的直径
const MAIN_BUTTON_DIAM = 90
const CHILD_BUTTON_DIAM = 50
const NUM_CHILDREN = 5;
// Hard coded position values of the mainButton
const M_X = 490;
const M_Y = 450;
const OFFSET = 0.4;

let childButtonIcons = ['pencil', 'at', 'camera', 'bell', 'comment', 'bolt', 'ban', 'code'];

// How far away from the main button does the child buttons go
const FLY_OUT_RADIUS = 120,
    SEPARATION_ANGLE = 40, //degrees
    FAN_ANGLE = (NUM_CHILDREN - 1) * SEPARATION_ANGLE, //degrees
    BASE_ANGLE = ((180 - FAN_ANGLE)/2); // degrees

const SPRING_CONFIG = {stiffness: 400, damping: 18}
const SPRING_CONFIG1 = {stiffness: 500, damping: 30}
function toRadians(degrees) {
    return degrees * DEG_TO_RAD;
}


function finalDeltaPositions(index) {
    let angle = BASE_ANGLE + ( index * SEPARATION_ANGLE );
    return {
        deltaX: FLY_OUT_RADIUS * Math.cos(toRadians(angle)) - (CHILD_BUTTON_DIAM/2),
        deltaY: FLY_OUT_RADIUS * Math.sin(toRadians(angle)) + (CHILD_BUTTON_DIAM/2)
    };
}

class APP extends React.Component {
    constructor(props) {
        super(props);   

        this.state = {
            isOpen: false
        };
    }
    componentDidMount() {
        window.addEventListener('click',this.closeMenu.bind(this))
    }
    closeMenu(){
        this.setState({isOpen:false})
    }
    mainButtonStyles(){
        return {
            width:MAIN_BUTTON_DIAM,
            height:MAIN_BUTTON_DIAM,
            top:M_Y - MAIN_BUTTON_DIAM/2,
            left:M_X - MAIN_BUTTON_DIAM/2
        }
    }
    initialChildButtonStyles(){
        return {
            width:CHILD_BUTTON_DIAM,
            height:CHILD_BUTTON_DIAM,
            top:M_Y - CHILD_BUTTON_DIAM/2,
            left:M_X - CHILD_BUTTON_DIAM/2,
            scale: 0.5,
            rotate:-180
        }
    }
    finalChildButtonStyles(childIndex){
        let {deltaY,deltaX} = finalDeltaPositions(childIndex)
        return {
            width:CHILD_BUTTON_DIAM,
            height:CHILD_BUTTON_DIAM,
            left:M_X + deltaX,
            top:M_Y - deltaY,
            scale:1,
            rotate:0
        }
    }

    openMenu(e){
        e.stopPropagation();
        let {isOpen} = this.state;
        this.setState({isOpen:!isOpen})
    }
    renderChildButtons() {
        const {isOpen} = this.state;
        let targetButtonStyles = range(NUM_CHILDREN).map(i=>{
            return isOpen ? this.finalChildButtonStyles(i) : this.initialChildButtonStyles()
        })
        targetButtonStyles.reverse()
        let calculateStylesForNextFrame = prevFrameStyles=>{
            let springStyle = (style) => {
                return Object.keys(style).reduce((result,key)=>{
                    result[key] = spring(style[key],SPRING_CONFIG)
                    return result;
                },{})
            }
            const scaleMin = this.initialChildButtonStyles().scale;
            const scaleMax = this.finalChildButtonStyles(0).scale;
            let nextFrameTargetStyles = prevFrameStyles.map(
                (buttonStyleInPreviousFrame,i) => {
                    if (i===0){
                        return springStyle(targetButtonStyles[i])
                    }
                    const prevButtonScale = prevFrameStyles[i - 1].scale;
                    const shouldApplyTargetStyle = () => {
                        if (isOpen) {
                            return prevButtonScale >= scaleMin + OFFSET;
                        } else {
                            return prevButtonScale <= scaleMax - OFFSET;
                        }
                    };
                    return shouldApplyTargetStyle() ? springStyle(targetButtonStyles[i]) : buttonStyleInPreviousFrame
                }
            )
            return nextFrameTargetStyles
        }
        return (
            <StaggeredMotion defaultStyles={targetButtonStyles}
                styles={calculateStylesForNextFrame}>
                {interpolatedStyles =>
                    <div>
                        {interpolatedStyles.map(({top,left,scale,rotate},i) =>
                            <div className="child-button"
                             style={{left,
                                top,
                                transform:`scale(${scale}) rotate(${rotate}deg)`}}
                             key={i}
                            >
                                <i className={"fa fa-" + childButtonIcons[i] + " fa-lg"}></i>
                            </div>
                        )}
                    </div>

                }
            </StaggeredMotion>
        )
    }

    render(){
        let {isOpen} = this.state;
        let mainButtonRotation = isOpen?{rotate:spring(0,SPRING_CONFIG1)}:{rotate:spring(-135,SPRING_CONFIG1)}
        return(
            <div>
                {this.renderChildButtons()}
                <Motion style={mainButtonRotation}>
                    {({rotate})=>
                        <div style={{...this.mainButtonStyles(),transform:`rotate(${rotate}deg)`}} className="main-button" onClick={(e)=>this.openMenu(e)}>
                            <i className="fa fa-close fa-3x"/>
                        </div>  
                    }
                </Motion>
     
            </div>
        )
    }
};



ReactDOM.render(<APP />,document.getElementById('app'))