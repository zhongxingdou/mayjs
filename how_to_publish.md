# Publish Mayjs

## update version and add tag
* update version field in bower.json
* update version field in package.json
* commit with comment "release x.x.x"
* git tag x.x.x
* git push --tag

## publish for bower
bower register mayjs git://github.com/zhongxingdou/mayjs.git

## publish for npm
npm publish