package com.zhaenx.kasir.controller;

import com.zhaenx.kasir.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class AuthController {

    @Autowired
    private AuthService authService;

    @GetMapping("/login")
    public String loginPage(
        @RequestParam(required = false) String error, Model model
    ) {
        if (error != null) {
            model.addAttribute("error", error);
        }
        return "login";
    }

    @PostMapping("/login")
    public String login(

            @RequestParam String email,
            @RequestParam String password,
            HttpSession session

    ) {

        boolean success =
                authService.login(
                        email,
                        password
                );

        if(success) {

            session.setAttribute(
                    "loggedIn",
                    true
            );

            session.setAttribute(
                    "email",
                    email
            );

            return "redirect:/";
        }

        return "redirect:/login?error";
    }

    @GetMapping("/logout")
    public String logout(
            HttpSession session
    ) {

        session.invalidate();

        return "redirect:/login";
    }
}