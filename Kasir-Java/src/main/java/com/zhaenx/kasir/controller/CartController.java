package com.zhaenx.kasir.controller;

import com.zhaenx.kasir.model.CartItem;
import com.zhaenx.kasir.service.CalculationService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController

@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CalculationService calc;

// add cart
    @PostMapping("/add")
    public Map<String,Object> add(

            @RequestBody CartItem item,
            HttpSession session

    ){

        List<CartItem> cart =
                (List<CartItem>)
                        session.getAttribute(
                                "cart"
                        );

        if(cart == null)
            cart = new ArrayList<>();

        boolean found = false;

        for(CartItem c : cart){

            if(c.getId()
                    .equals(item.getId())){

                c.setQty(
                        c.getQty()+1
                );

                found=true;
                break;
            }
        }

        if(!found){

            item.setQty(1);
            cart.add(item);
        }

        session.setAttribute(
                "cart",
                cart
        );

        return buildResponse(cart);
    }

    @GetMapping
    public Map<String,Object> get(
            HttpSession session
    ){

        List<CartItem> cart =
                (List<CartItem>)
                        session.getAttribute(
                                "cart"
                        );

        if(cart == null)
            cart = new ArrayList<>();

        return buildResponse(cart);
    }

    private Map<String,Object>
    buildResponse(
            List<CartItem> cart
    ){

        Map<String,Object> map =
                new HashMap<>();

        map.put(
                "cart",
                cart
        );

        map.put(
                "summary",
                calc.calculate(cart)
        );

        return map;
    }

    // Kurang Qty

    @PostMapping("/minus/{id}")
    public Map<String,Object> minus(

        @PathVariable String id,
        HttpSession session

){

    List<CartItem> cart =
            (List<CartItem>)
            session.getAttribute("cart");

    if(cart == null)
        cart = new ArrayList<>();

    Iterator<CartItem> iterator =
            cart.iterator();

    while(iterator.hasNext()){

        CartItem item =
                iterator.next();

        if(item.getId().equals(id)){

            item.setQty(
                    item.getQty()-1
            );

            if(item.getQty() <= 0){

                iterator.remove();
            }

            break;
        }
    }

    session.setAttribute(
            "cart",
            cart
    );

    return buildResponse(cart);
}

// HAPUS ITEM

    @PostMapping("/remove/{id}")
    public Map<String,Object> remove(

            @PathVariable String id,
            HttpSession session

    ){

        List<CartItem> cart =
                (List<CartItem>)
                        session.getAttribute("cart");

        if(cart == null)
            cart = new ArrayList<>();

        Iterator<CartItem> iterator =
                cart.iterator();

        while(iterator.hasNext()){

            CartItem item =
                    iterator.next();

            if(item.getId().equals(id)){

                iterator.remove();
                break;
            }
        }

        session.setAttribute(
                "cart",
                cart
        );

        return buildResponse(cart);
    }

    // Clear Cart

    @PostMapping("/clear")
    public Map<String,Object> clear(
            HttpSession session
    ){

        session.setAttribute(
                "cart",
                new ArrayList<CartItem>()
        );

        return buildResponse(new ArrayList<CartItem>());
    }

//     PLUS TMBL
@PostMapping("/plus/{id}")
public Map<String,Object> plus(

        @PathVariable String id,
        HttpSession session

){

    List<CartItem> cart =
            (List<CartItem>)
            session.getAttribute("cart");

    if(cart == null)
        cart = new ArrayList<>();

    for(CartItem item : cart){

        if(item.getId().equals(id)){

            item.setQty(
                    item.getQty()+1
            );

            break;
        }
    }

    session.setAttribute(
            "cart",
            cart
    );

    return buildResponse(cart);
}       
}