set -e

rm -rf build

npm run docs:build

cd build

git init
git add .
git commit -m "deploy"
git branch -M main
git push -f git@github.com:withlone/camille.github.io.git main

cd -