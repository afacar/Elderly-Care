import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import { Text } from 'react-native-elements';
import { connect } from 'react-redux';
import * as actions from '../appstate/actions';
import ProviderCard from '../components/common/ProviderCard';

class ProviderList extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `Uzman Listesi`,
    headerTitleStyle: { textAlign: 'center', alignSelf: 'center' },
    headerStyle: {
      backgroundColor: 'white',
    },
    headerForceInset: { vercical: 'never' },
  });

  state = { /** List of provider data */
    providers: {}, // { providerId: {profile} }
    errorMessages: {}
  }

  _isMounted = null;

  _renderEmptyItem = () => {
    return (
      <Text>Kayıtlı uzman bulunamadı!</Text>
    );
  }

  _renderItem = ({ item }) => {
    const providerId = item;
    let provider = { ...this.state.providers[providerId], providerId };
    return <ProviderCard provider={provider} />
  }

  render() {

    return (
      <View>
        <FlatList
          data={Object.keys(this.state.providers)}
          renderItem={this._renderItem}
          ListEmptyComponent={this._renderEmptyItem}
          keyExtractor={(item) => item}
        />
      </View>
    );
  }

  fetchProviders = async () => {
    try {
      await this.props.fetch_providers((profile) => {
        this._isMounted && this.setState(previousState => {
          const { providerId } = profile;
          const { providers } = previousState;

          //if (!providers[providerId]) providers[providerId] = {};
          providers[providerId] = profile;
          console.log('!Returning new state ', providers);
          return { providers };
        });
      });
    } catch (error) {
      console.error('ProviderList didMount has error:', error.message);
    }
  }

  async componentDidMount() {
    this._isMounted = true;
    this.fetchProviders();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
}

export default connect(null, actions)(ProviderList);