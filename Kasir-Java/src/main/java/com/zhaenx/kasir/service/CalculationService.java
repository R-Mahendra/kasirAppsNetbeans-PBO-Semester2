package com.zhaenx.kasir.service;

import com.zhaenx.kasir.model.CartItem;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CalculationService {

    public Map<String,Integer>
    calculate(
            List<CartItem> cart
    ) {

        int subtotal = 0;

        for(CartItem item : cart){

            subtotal += item.getSubtotal();
        }

        int diskon =
                subtotal * 10 / 100;

        int dpp =
                subtotal - diskon;

        int ppn =
                dpp * 10 / 100;

        int total =
                dpp + ppn;

        Map<String,Integer> map =
                new HashMap<>();

        map.put(
                "subtotal",
                subtotal
        );

        map.put(
                "diskon",
                diskon
        );

        map.put(
                "ppn",
                ppn
        );

        map.put(
                "total",
                total
        );

        return map;
    }
}