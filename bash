# 在项目根目录执行
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/MindMate.git
git push -u origin main

# 本地修改后执行
git add .
git commit -m "Update chat function"
git push origin main
