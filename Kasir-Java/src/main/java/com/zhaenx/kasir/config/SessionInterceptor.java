package com.zhaenx.kasir.config;

import jakarta.servlet.http.*;
import org.springframework.web.servlet.HandlerInterceptor;

public class SessionInterceptor
        implements HandlerInterceptor {

    @Override
    public boolean preHandle(

            HttpServletRequest request,
            HttpServletResponse response,
            Object handler

    ) throws Exception {

        String uri =
                request.getRequestURI();

        if(uri.startsWith("/login"))
            return true;

        if(uri.startsWith("/css"))
            return true;

        if(uri.startsWith("/js"))
            return true;

        if(uri.startsWith("/img"))
            return true;

        Boolean loggedIn =
                (Boolean)
                        request
                        .getSession()
                        .getAttribute(
                                "loggedIn"
                        );

        if(loggedIn == null) {

            response.sendRedirect(
                    "/login"
            );

            return false;
        }

        return true;
    }
}