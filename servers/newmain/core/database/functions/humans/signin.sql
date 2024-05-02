create or replace function humans_signin(em text, pass text)
	returns text as $$
	declare
		human_id bigint;
		t        text;
	begin
		select id into human_id from human where email = em and password = pass limit 1;
		if found then
			select session.token into t from session where user_id = human_id limit 1;
			if found then
				return t;
			else
				raise exception 'access denied';
			end if;
		else
			raise exception 'human not found';
		end if;
	end $$
	language plpgsql;