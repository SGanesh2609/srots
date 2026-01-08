# TODO: Align Models and Repositories with DB Schema

## Issues Identified
- [ ] UserEntity model incomplete - missing fields from 'users' table
- [x] Student model empty - needs proper definition
- [x] Missing StudentRepository - referenced in StudentService
- [ ] Company model table name mismatch - 'companies' vs 'global_companies'
- [ ] Missing StudentLanguageRepository
- [ ] Verify all repository methods used in services exist

## Tasks
1. [x] Update UserEntity model to match 'users' table schema
2. [x] Define proper Student model (likely combining UserEntity + StudentProfile)
3. [x] Create StudentRepository interface
4. [x] Fix Company model table name to 'global_companies'
5. [x] Create StudentLanguageRepository
6. [ ] Add any missing repository methods used in services
7. [ ] Verify all models match schema exactly
