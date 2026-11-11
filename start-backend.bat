@echo off
echo Starting Spring Boot Backend with H2 Database on port 8081...
cd backend
"C:\Users\DELL\.m2\wrapper\dists\apache-maven-3.9.12\59fe215c0ad6947fea90184bf7add084544567b927287592651fda3782e0e798\bin\mvn.cmd" spring-boot:run
pause

