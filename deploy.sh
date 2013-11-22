#!/bin/sh

DEPLOY_DIR="deploy"
VERSIONS_DIR="versions"
VERSION="$1"
if [ -d $DEPLOY_DIR ]
  then
  echo 'Directory exists'
else
  mkdir -p $DEPLOY_DIR 	  
fi  

if [ -d $VERSIONS_DIR ]
  then
  echo 'Directory exists'
else
  mkdir -p $VERSIONS_DIR 	  
fi  

rm -rf $DEPLOY_DIR/app
mkdir $DEPLOY_DIR/app

cp -r app $DEPLOY_DIR/app

zip -r $VERSIONS_DIR/pnrstatus-$VERSION.zip $DEPLOY_DIR/app/app
