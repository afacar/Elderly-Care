import React, { Component } from "react";
import { Text } from "react-native";

export function Label(props) {
    return (
      <Text style={{ fontSize: 18, paddingLeft: 10, fontWeight: 'bold', color: '#3e464e' }}>
        {props.children}
      </Text>
    );
}

export function H3(props) {
  return (
    <Text style={{ fontSize: 25, textAlign: 'center', fontWeight: 'bold', color: '#3e464e' }}>
      {props.children}
    </Text>
  );
}

export function ErrorLabel(props) {
  return (
    <Text style={{ marginLeft: 10, color: 'red', fontSize: 15, fontWeight: 'bold' }}>
      {props.children}
    </Text>
  );
}

export function Bold(props) {
  return (
    <Text style={{ fontSize: 15, fontWeight: 'bold' }}>
      {props.children}
    </Text>
  );
}

