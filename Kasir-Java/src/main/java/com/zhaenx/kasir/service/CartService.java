package com.zhaenx.kasir.service;

import com.zhaenx.kasir.model.CartItem;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CartService {

    public List<CartItem> getCart(
            List<CartItem> cart
    ) {

        if(cart == null)
            return new ArrayList<>();

        return cart;
    }
}