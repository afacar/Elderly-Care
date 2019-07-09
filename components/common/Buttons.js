import React, { Component } from 'react';
import { TouchableHighlight } from "react-native";
import { Button, ButtonGroup } from 'react-native-elements';
import { GalleryIcon, LogoutIcon, CancelIcon, DeleteIcon, SaveIcon, EditIcon, CameraIcon, AttachmentIcon, MicIcon, PauseIcon, PlayIcon, ResetIcon } from "./Icons";

export class SaveButton extends Component {
  render() {
    return (
      <Button
        title={this.props.title || "Kaydet"}
        onPress={this.props.onPress}
        disabled={this.props.disabled}
        titleStyle={styles.titleStyle}
        containerStyle={styles.buttonStyle}
        icon={<SaveIcon />}
        buttonStyle={{ backgroundColor: '#397847' }}
      />
    );
  }
}

export class EditButton extends Component {
  render() {
    return (
      <Button
        type='clear'
        title={this.props.title || "Düzenle"}
        onPress={this.props.onPress}
        disabled={this.props.disabled}
        titleStyle={{ color: '#041256' }}
        containerStyle={styles.buttonStyle}
        icon={<EditIcon color='#041256' />}
      //buttonStyle={}
      />
    );
  }
}

export class DeleteButton extends Component {
  render() {
    return (
      <Button
        title={this.props.title || "Sil"}
        onPress={this.props.onPress}
        disabled={this.props.disabled}
        titleStyle={styles.titleStyle}
        containerStyle={styles.buttonStyle}
        icon={<DeleteIcon />}
        buttonStyle={{ backgroundColor: '#b70000' }}
      />
    );
  }
}

export class CancelButton extends Component {
  render() {
    return (
      <Button
        title={this.props.title || "İptal"}
        onPress={this.props.onPress}
        icon={<CancelIcon />}
        titleStyle={styles.titleStyle}
        containerStyle={styles.buttonStyle}
        buttonStyle={{ backgroundColor: '#ee7e68' }}
      />
    );
  }
}

export class LogoutButton extends Component {
  render() {
    return (
      <Button
        title={this.props.title || "Çıkış"}
        onPress={this.props.onPress}
        icon={<LogoutIcon />}
        titleStyle={styles.titleStyle}
        containerStyle={styles.buttonStyle}
        buttonStyle={{ backgroundColor: '#b70000' }}
      />
    );
  }
}

export class RadioButtons extends Component {
  render() {
    return (
      <ButtonGroup
        onPress={this.props.onPress}
        selectedIndex={this.props.selectedIndex}
        buttons={this.props.buttons}
        disabled={this.props.disabled}
        buttonStyle={{ borderBottomWidth: 2, borderRadius: 10 }}
        containerStyle={{ flex: 1, borderWidth: 0 }}
        selectedButtonStyle={{ borderBottomWidth: 0, backgroundColor: '#93cbbd' }}
        innerBorderStyle={{ width: 0 }}
        textStyle={{ fontWeight: "bold", fontSize: 17 }}
      />
    );
  }
}

export class MoodButtons extends Component {
  render() {
    return (
      <ButtonGroup
        onPress={this.props.onPress}
        selectedIndex={this.props.selectedIndex}
        buttons={this.props.buttons}
        buttonStyle={{
          alignSelf: 'center',
          borderRadius: 10,
          width: 60, height: 60,
          borderBottomWidth: 2,
        }}
        containerStyle={{
          height: 100,
          flex: 1,
          borderWidth: 0,
          justifyContent: 'space-evenly',
          alignItems: 'center',
          padding: 15
        }}
        textStyle={{ fontSize: 41 }}
        selectedButtonStyle={{ borderBottomWidth: 0, backgroundColor: '#93cbbd' }}
        innerBorderStyle={{ width: 0 }}
      />
    );
  }
}

export class HungerConditionButtons extends Component {
  render() {
    return (
      <ButtonGroup
        onPress={this.props.onPress}
        selectedIndex={this.props.selectedIndex}
        buttons={this.props.buttons}
        buttonStyle={{ borderBottomWidth: 2, borderRadius: 10 }}
        containerStyle={{ flex: 1, borderWidth: 0, marginTop: 15 }}
        selectedButtonStyle={{ borderBottomWidth: 0, backgroundColor: '#c8bac1' }}
        innerBorderStyle={{ width: 0 }}
        textStyle={{ fontWeight: "bold", fontSize: 17 }}
      />
    );
  }
}

export class ImageButton extends Component {
  render() {
    return (
      <Button
        title=""
        onPress={this.props.onPress}
        icon={<GalleryIcon />}
        containerStyle={styles.buttonStyle}
        buttonStyle={{ backgroundColor: 'transparent', padding: 0 }}
      />
    )
  }
}

export class CameraButton extends Component {
  render() {
    return (
      <Button
        title=""
        onPress={this.props.onPress}
        icon={<CameraIcon />}
        containerStyle={styles.buttonStyle}
        buttonStyle={{ backgroundColor: 'transparent', padding: 0 }}
      />
    )
  }
}

export class AttachmentButton extends Component {
  render() {
    return (
      <Button
        title=""
        onPress={this.props.onPress}
        icon={<AttachmentIcon />}
        containerStyle={styles.buttonStyle}
        buttonStyle={{ backgroundColor: 'transparent', padding: 0 }}
      />
    )
  }
}

export class MicButton extends Component {
  render() {
    return (
      <Button
        title=""
        onPress={this.props.onPress}
        icon={<MicIcon isListening={this.props.isListening} />}
        containerStyle={styles.buttonStyle}
        buttonStyle={{ backgroundColor: 'transparent', padding: 0 }}
      />
    )
  }
}

export class PlayButton extends Component {
  render() {
    return (
      <Button
        title=""
        onPress={this.props.onPress}
        icon={<PlayIcon isListening={this.props.isListening} />}
        containerStyle={styles.buttonStyle}
        buttonStyle={{ backgroundColor: 'transparent', padding: 0 }}
      />
    )
  }
}

export class PauseButton extends Component {
  render() {
    return (
      <Button
        title=""
        onPress={this.props.onPress}
        icon={<PauseIcon isListening={this.props.isListening} />}
        containerStyle={styles.buttonStyle}
        buttonStyle={{ backgroundColor: 'transparent', padding: 0 }}
      />
    )
  }
}

export class ResetButton extends Component {
  render() {
    return (
      <Button
        title=""
        onPress={this.props.onPress}
        containerStyle={styles.buttonStyle}
        buttonStyle={{ backgroundColor: 'transparent', padding: 0 }}
      />
    );
  }
}

const styles = {
  buttonStyle: {
    flex: 1,
    padding: 1,
    borderRadius: 20,
    justifyContent: 'center'
  },
  titleStyle: {
    fontSize: 19,
  },
}
