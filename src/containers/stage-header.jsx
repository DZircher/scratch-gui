import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import VM from 'scratch-vm';
import {STAGE_SIZE_MODES} from '../lib/layout-constants';
import {setStageSize} from '../reducers/stage-size';
import {setFullScreen} from '../reducers/mode';

import {
    getIsError,
    getIsShowingProject
} from '../reducers/project-state';


import {connect} from 'react-redux';

import StageHeaderComponent from '../components/stage-header/stage-header.jsx';

// eslint-disable-next-line react/prefer-stateless-function
class StageHeader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleKeyPress'
        ]);
    }
    componentDidMount () {
        document.addEventListener('keydown', this.handleKeyPress);
    }

    componentDidUpdate(prevProps){
        if (this.props.isShowingProject && !prevProps.isShowingProject) {

            if (this.props.vm.initialized){
                // decide which project files to load
                debugger;

                var params = Array.from(new URLSearchParams(window.location.search));
                
                var projectName;
                if (params.length == 0)
                {
                    projectName = "";
                }
                else
                {
                    projectName = params[0][0];
                }

                if (projectName.toLowerCase() === "marbleroll")
                {
                    projectName = "./static/Scratch_Kids.sb3"
                }
                else
                {
                    projectName = "./static/DanaScratchDemo.sb3"
                }

                fetch(projectName)
                .then(response => {
                  if (response.status !== 200)  { 
                    throw new Error('failed to download file')
                  } else {
                    return response.arrayBuffer();
                  }
                })
                .then(arrayBuffer => {
        
                    this.props.vm.loadProject(arrayBuffer)
                    .then(() => {
                        
                       this.props.onSetStageFull();
                        
                    })
                    .catch(error => {
                        debugger;
                        log.warn(error);
                        alert(this.props.intl.formatMessage(messages.loadError)); // eslint-disable-line no-alert
                        this.props.onLoadingFinished(this.props.loadingState, false);
                    });
               })        
            }
        }
    }
    componentWillUnmount () {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    handleKeyPress (event) {
        if (event.key === 'Escape' && this.props.isFullScreen) {
            this.props.onSetStageUnFull(false);
        }
    }
    render () {
        const {
            ...props
        } = this.props;
        return (
            <StageHeaderComponent
                {...props}
                onKeyPress={this.handleKeyPress}
            />
        );
    }
}

StageHeader.propTypes = {
    isFullScreen: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    isShowingProject: PropTypes.bool,
    onSetStageUnFull: PropTypes.func.isRequired,
    showBranding: PropTypes.bool,
    stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)),
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => ({
    stageSizeMode: state.scratchGui.stageSize.stageSize,
    showBranding: state.scratchGui.mode.showBranding,
    isFullScreen: state.scratchGui.mode.isFullScreen,
    isShowingProject: getIsShowingProject(state.scratchGui.projectState.loadingState),
    isPlayerOnly: state.scratchGui.mode.isPlayerOnly
});

const mapDispatchToProps = dispatch => ({
    onSetStageLarge: () => dispatch(setStageSize(STAGE_SIZE_MODES.large)),
    onSetStageSmall: () => dispatch(setStageSize(STAGE_SIZE_MODES.small)),
    onSetStageFull: () => dispatch(setFullScreen(true)),
    onSetStageUnFull: () => dispatch(setFullScreen(false))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StageHeader);
