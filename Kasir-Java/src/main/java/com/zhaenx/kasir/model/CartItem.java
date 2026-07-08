package com.zhaenx.kasir.model;

public class CartItem {

    private String id;
    private String nama;
    private Integer price;
    private Integer qty;
    private String image;

    public Integer getSubtotal() {

        if(price == null || qty == null)
            return 0;

        return price * qty;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNama() {
        return nama;
    }

    public void setNama(String nama) {
        this.nama = nama;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public Integer getQty() {
        return qty;
    }

    public void setQty(Integer qty) {
        this.qty = qty;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}