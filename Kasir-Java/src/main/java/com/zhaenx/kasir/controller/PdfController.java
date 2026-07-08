package com.zhaenx.kasir.controller;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.zhaenx.kasir.model.CartItem;

import jakarta.servlet.http.*;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PdfController {

    @GetMapping(
            value="/pdf",
            produces="application/pdf"
    )
    public void pdf(

            HttpServletResponse response,
            HttpSession session

    ) throws Exception {

        List<CartItem> cart =
                (List<CartItem>)
                        session
                        .getAttribute("cart");

        Document doc =
                new Document();

        PdfWriter.getInstance(
                doc,
                response
                .getOutputStream()
        );

        response.setHeader(
                "Content-Disposition",
                "attachment; filename=struk.pdf"
        );

        doc.open();

        doc.add(
                new Paragraph(
                        "STRUK PEMBELIAN"
                )
        );

        doc.add(
                new Paragraph(
                        "=================="
                )
        );

        for(CartItem item : cart){

            doc.add(
                    new Paragraph(
                            item.getNama()
                            +" x "
                            +item.getQty()
                    )
            );
        }

        doc.close();
    }
}