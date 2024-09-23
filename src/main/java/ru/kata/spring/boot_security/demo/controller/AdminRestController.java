package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.model.Role;
import ru.kata.spring.boot_security.demo.model.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
public class AdminRestController {
    private final UserService userService;
    private final RoleService roleService;

    @Autowired
    public AdminRestController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    // все пользователи
    @GetMapping("/users")
    @PreAuthorize("hasRole('ROLE_admin')")
    public ResponseEntity<Set<User>> getAllUsers() {
        Set<User> allUsers = userService.listUsers();
        return ResponseEntity.ok(allUsers);
    }

    // удаление
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ROLE_admin')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userService.findUser(id) == null) {
            return ResponseEntity.notFound().build();
        }
        userService.removeUserById(id);
        return ResponseEntity.noContent().build();
    }

    // получение пользователя по ид
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.findUser(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    // новый юзер
    @PostMapping("/users")
    @PreAuthorize("hasRole('ROLE_admin')")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        try {
            Set<Role> roles = new HashSet<>();
            if (user.getRoles() != null) {
                for (Role role : user.getRoles()) {
                    Role roleFromDB = roleService.findRole(role.getId());
                    if (roleFromDB != null) {
                        roles.add(roleFromDB);
                    } else {
                        System.err.println("Роль с id " + role.getId() + " не найдена");
                    }
                }
            }
            user.setRoles(roles);
            userService.add(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (Exception e) {
            System.err.println("Ошибка при добавлении пользователя: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // редактирую
    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ROLE_admin')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User changedUser) {
        if (userService.findUser(id) == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            Set<Role> roles = new HashSet<>();
            if (changedUser.getRoles() != null) {
                for (Role role : changedUser.getRoles()) {
                    Role roleFromDB = roleService.findRole(role.getId());
                    if (roleFromDB != null) {
                        roles.add(roleFromDB);
                    } else {
                        System.err.println("Роль с id " + role.getId() + " не найдена");
                    }
                }
            }
            changedUser.setRoles(roles);
            userService.update(changedUser);
            return ResponseEntity.ok(changedUser);
        } catch (Exception e) {
            System.err.println("Ошибка при обновлении пользователя: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}