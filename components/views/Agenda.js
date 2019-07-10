import React, { PureComponent } from 'react';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import { connect } from 'react-redux';
import _ from 'lodash';

import { CalendarCard, EmptyCalendarCard } from "./CalendarCard";
import { Translations } from "../../constants/Translations";
import * as actions from '../../appstate/actions';

LocaleConfig.locales['tr'] = Translations['TIME_TR'];

LocaleConfig.defaultLocale = 'tr';

class AgendaScreen extends PureComponent {

  state = {
    items: {},
  };

  _isMounted = null;

  render() {
    return (
      <Agenda
        items={this.state.items}
        loadItemsForMonth={this.loadItemsForMonth}
        pastScrollRange={40}
        //displayLoadingIndicator
        renderItem={this.renderItem.bind(this)}
        renderEmptyDate={this.renderEmptyDate.bind(this)}
        rowHasChanged={this.rowHasChanged.bind(this)}
        firstDay={1}
        onDayPress={(day) => { console.log("onDayPress day", day) }}
        onDayChange={(day) => this.loadItemsForNextMonth(day)}
        hideKnob={false}
        //displayLoadingIndicator
        //renderKnob={this.renderKnob}
        theme={{
          'stylesheet.agenda.header': {
            header: {
              height: 0
            },
            week: {
              height: 0
            }
          }
        }}
      />
    );
  }

  _getCurrentYMD = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDay();
    return { year, month, day };
  }

  timeToString(time) {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  }

  loadItemsForNextMonth = (date) => {
    // load the empty days of current month
    let year = date.year;
    let month = date.month;
    let day = date.day;
    if (day > 25) {
      month++;
      if (month == 13) {
        year++;
        month = 1;
      }
      console.log("loadItemsForNextMonth ", month, year);
      this.loadItemsForMonth({ year, month, day });
    }
  }

  loadItemsForMonth = (date) => {
    // load the empty days of current month
    console.log("LoadItems for date", date);
    let { year, month, day } = date;
    const themonth = (month < 10) ? '0' + month : month;

    (this._isMounted) && this.setState(previousState => {
      for (let i = 1; i <= 31; i++) {
        const theday = (i < 10) ? '0' + i : i;
        const newDay = year + '-' + themonth + '-' + theday;
        if (!previousState.items[newDay]) {
          previousState.items[newDay] = [];
        }
      }
      // Load for the next month too!
      month++;
      if (month == 13) {
        year++;
        month = 1;
      }
      const nextMonth = (month < 10) ? '0' + month : month;
      for (let i = 1; i <= 31; i++) {
        const theday = (i < 10) ? '0' + i : i;
        const newDay = year + '-' + nextMonth + '-' + theday;
        if (!previousState.items[newDay]) {
          previousState.items[newDay] = [];
        }
      }
      return { items: previousState.items };
    });

  }

  componentDidMount() {
    this._isMounted = true;
    this.props.fetch_calendar(this._setCalendar);
    this.loadItemsForMonth(this._getCurrentYMD());
  }

  _setCalendar = (item, op) => {
    /**
     * Callback function to setState for calendar items
     */
    const date = item.selectedDate;
    if (!this._isMounted) return;
    switch (op) {
      case "child_added":
        this.setState((previousState) => {
          if (!previousState.items[date]) {
            previousState.items[date] = [];
          }
          previousState.items[date].push(item);
          return { items: previousState.items };
        });
        break;
      case "child_changed":
        this.setState((previousState) => {
          for (let dateKey in previousState.items) {
            for (let i = 0; i < previousState.items[dateKey].length; i++) {
              // Find the previous location of item
              if (previousState.items[dateKey][i].key == item.key) {
                if (dateKey == date) {
                  // if date is NOT changed, update the old item with the new one
                  previousState.items[date][i] = item;
                  return { items: previousState.items };
                }
                // if the date of event is changed, remove old item
                previousState.items[dateKey].splice(i, 1);
                // Then create new item on calendar
                if (!previousState.items[date]) previousState.items[date] = [];
                previousState.items[date].push(item);
                return { items: previousState.items };
              }
            }
          }
        });
        break;
      case "child_removed":
        this.setState((previousState) => {
          for (let i = 0; i < previousState.items[date].length; i++) {
            if (previousState.items[date][i].key == item.key) {
              previousState.items[date].splice(i, 1);
              return { items: previousState.items };
            }
          }
        });
        break;
      default:
        return;
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  renderItem(item) {
    // Render item (reminder or measurement) conditionally
    return (
      <CalendarCard item={item} openModal={this.props.openModal} />
    );
  }

  renderEmptyDate(time) {
    const currentDate = this.timeToString(time);
    return (
      <EmptyCalendarCard currentDate={currentDate} openModal={this.props.openModal} />
    );
  }

  rowHasChanged(r1, r2) { return !_.isEqual(r1, r2); }

}

export default connect(null, actions)(AgendaScreen);
