-- Create test users --
insert into
   auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) (
        select
            '00000000-0000-0000-0000-000000000000',
            uuid_generate_v4 (),
            'authenticated',
            'authenticated',
            'user' || (ROW_NUMBER() OVER ()) || '@example.com',
            crypt ('password123', gen_salt ('bf')),
            current_timestamp,
            current_timestamp,
            current_timestamp,
            '{"provider":"email","providers":["email"]}',
            '{}',
            current_timestamp,
            current_timestamp,
            '',
            '',
            '',
            ''
        from
            generate_series(1, 4)
    );

-- test user email identities --
insert into
    auth.identities (
        id,
        user_id,
        -- New column
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) (
        select
            uuid_generate_v4 (),
            id,
            -- New column
            id,
            format('{"sub":"%s","email":"%s"}', id :: text, email) :: jsonb,
            'email',
            current_timestamp,
            current_timestamp,
            current_timestamp
        from
            auth.users
    );

insert into event_list (event, alias, date) values 
    ('2024prac', 'Practice Event', '01-01-2025'),
    ('2025bcvi', 'Canadian Pacific Regional', '02-26-2025'),
    ('2025casf', 'San Francisco Regional', '03-21-2025'),
    ('2025caav', 'Aerospace Valley Regional', '04-02-2025');

insert into event_schedule (event, match, team, alliance) values 
    ('2024prac', 1, 'frc846', 'red'),
    ('2024prac', 1, 'frc254', 'red'),
    ('2024prac', 1, 'frc841', 'red'),
    ('2024prac', 1, 'frc6036', 'blue'),
    ('2024prac', 1, 'frc1690', 'blue'),
    ('2024prac', 1, 'frc5940', 'blue');

insert into event_match_data (event, match, team, alliance, data_raw, data, name) values 
    ('2024prac', 1, 'frc254', 'red', '[]', '[]', 'tester2'),
    ('2024prac', 1, 'frc841', 'red', '[]', '[]', 'tester3'),
    ('2024prac', 1, 'frc1690', 'blue', '[]', '[]', 'tester5'),
    ('2024prac', 1, 'frc5940', 'blue', '[]', '[]', 'tester6');

insert into event_team_data (event, team, data) values
    ('2024prac', 'frc846', '[]'),
    ('2024prac', 'frc254', '[]');