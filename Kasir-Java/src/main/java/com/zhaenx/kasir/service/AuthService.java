package com.zhaenx.kasir.service;

import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final String EMAIL =
            "zhaenx_id@yeswehack.com";

    private static final String PASSWORD =
            "zh43nx";

    public boolean login(
            String email,
            String password
    ) {

        return EMAIL.equals(email)
                &&
                PASSWORD.equals(password);
    }
}