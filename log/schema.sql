create table problem (
  id serial,
  name varchar(12)
);

create table problem_instance (
  problem_id int,
  started_at timestamp
  completed_at timestamp null
);





