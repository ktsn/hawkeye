#!/bin/bash

terminate() {
  kill %1
  kill %2
}

tsc -w -p tsconfig.json &
grunt watch &

trap terminate SIGINT
wait
