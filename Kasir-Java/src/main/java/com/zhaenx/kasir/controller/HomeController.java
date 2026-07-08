package com.zhaenx.kasir.controller;

import com.zhaenx.kasir.service.MenuService;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class HomeController {

    @Autowired
    private MenuService menuService;

    @GetMapping("/")
    public String home(
            Model model,
            HttpSession session
    ) {

        model.addAttribute(
                "menu",
                menuService.loadMenu()
        );

        return "index";
    }
}