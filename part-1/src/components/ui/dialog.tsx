"use client";

import { Dialog as ChakraDialog } from "@chakra-ui/react";
import { CloseButton } from "./close-button";
import * as React from "react";

interface DialogContentProps extends ChakraDialog.ContentProps {
  children?: React.ReactNode;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(props, ref) {
    const { children, ...rest } = props;
    return (
      <ChakraDialog.Positioner>
        <ChakraDialog.Content ref={ref} {...rest} asChild={false}>
          {children}
        </ChakraDialog.Content>
      </ChakraDialog.Positioner>
    );
  }
);

interface DialogCloseTriggerProps extends ChakraDialog.CloseTriggerProps {
  children?: React.ReactNode;
}

export const DialogCloseTrigger = React.forwardRef<HTMLButtonElement, DialogCloseTriggerProps>(
  function DialogCloseTrigger(props, ref) {
    return (
      <ChakraDialog.CloseTrigger
        position="absolute"
        top="2"
        insetEnd="2"
        {...props}
        asChild
      >
        <CloseButton size="sm" ref={ref}>
          {props.children}
        </CloseButton>
      </ChakraDialog.CloseTrigger>
    );
  }
);

export const DialogRoot = ChakraDialog.Root;
export const DialogTrigger = ChakraDialog.Trigger;
export const DialogHeader = ChakraDialog.Header;
export const DialogTitle = ChakraDialog.Title;
export const DialogDescription = ChakraDialog.Description;
export const DialogBody = ChakraDialog.Body;
export const DialogFooter = ChakraDialog.Footer;
export const DialogBackdrop = ChakraDialog.Backdrop;
