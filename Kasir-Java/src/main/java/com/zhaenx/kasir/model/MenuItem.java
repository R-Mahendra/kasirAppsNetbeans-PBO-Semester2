package com.zhaenx.kasir.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MenuItem {

    private String id;

    private String nama;

    private Integer price;

    @JsonProperty("img")
    private String img;

    public MenuItem(){}

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

    public String getImg() {
        return img;
    }

    public void setImg(String img) {
        this.img = img;
    }
}