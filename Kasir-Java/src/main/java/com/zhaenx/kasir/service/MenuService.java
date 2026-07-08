package com.zhaenx.kasir.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhaenx.kasir.model.MenuItem;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;

@Service
public class MenuService {

    private final ObjectMapper mapper =
            new ObjectMapper();

    public Map<String,List<MenuItem>>
    loadMenu() {

        try {

            InputStream is =
                    new ClassPathResource(
                            "menu.json")
                            .getInputStream();

            return mapper.readValue(
                    is,
                    new TypeReference<
                            Map<String,
                            List<MenuItem>>>() {}
            );

        } catch(Exception e) {

            return new HashMap<>();
        }
    }
}